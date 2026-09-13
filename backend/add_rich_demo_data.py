import asyncio
import os
import uuid
import json
import hashlib
import random
from datetime import datetime, timedelta
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.camera import Camera
from app.models.watchlist import Watchlist
from app.models.sighting import Sighting
from app.models.alert import Alert
from app.models.evidence import Evidence
from app.models.correlation import Correlation
from app.models.audit import AuditLog
from app.models.user import User
from app.core.config import settings
from app.core.logging import logger

DEMO_SUSPECT_VEHICLES = [
    {
        "plate": "GJ01AB1234",
        "class": "car",
        "watchlist_priority": "high",
        "reason": "Suspected vehicle in financial fraud investigation (FIR 2024/098)",
        "route_indices": [0, 1, 2, 3, 5, 8]
    },
    {
        "plate": "RJ14GH3456",
        "class": "car",
        "watchlist_priority": "critical",
        "reason": "Reported stolen luxury SUV - armed robbery involvement",
        "route_indices": [4, 6, 7, 9]
    },
    {
        "plate": "UP32PQ6677",
        "class": "truck",
        "watchlist_priority": "medium",
        "reason": "Vehicle flagged for repeated toll gate evasion and traffic warrants",
        "route_indices": [3, 4, 8, 9]
    },
    {
        "plate": "GJ05CD5678",
        "class": "car",
        "watchlist_priority": "low",
        "reason": "Suspicious vehicle reported scouting jewelry markets",
        "route_indices": [0, 2, 6]
    }
]

COMMUTER_TRAFFIC = [
    ("MH12EF9012", "motorcycle", 0.94),
    ("GJ18IJ7890", "car", 0.97),
    ("DL3CKL2233", "bus", 0.91),
    ("GJ01MN4455", "car", 0.95),
    ("GJ09RS8899", "car", 0.92),
    ("HR26TU1122", "truck", 0.89),
    ("GJ27XY9900", "car", 0.98),
    ("GJ06ZA1010", "car", 0.93),
    ("GJ03BC4040", "motorcycle", 0.90),
    ("MH04DE8080", "truck", 0.95),
]

async def seed_rich_demo_data():
    logger.info("Injecting rich demo investigation scenarios into SENTRAX...")
    async with AsyncSessionLocal() as db:
        admin_res = await db.execute(select(User).where(User.username == "admin"))
        admin = admin_res.scalar_one_or_none()

        cams_res = await db.execute(select(Camera).order_by(Camera.camera_id))
        cameras = cams_res.scalars().all()
        if not cameras:
            logger.error("No cameras found. Run seed_data.py first.")
            return

        now = datetime.utcnow()
        dummy_frame = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 4096 + b"\xFF\xD9"
        dummy_crop = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x01" * 2048 + b"\xFF\xD9"
        dummy_plate = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x02" * 1024 + b"\xFF\xD9"

        # 1. Ensure Watchlist entries
        for sveh in DEMO_SUSPECT_VEHICLES:
            wl_res = await db.execute(select(Watchlist).where(Watchlist.plate_text == sveh["plate"]))
            wl = wl_res.scalar_one_or_none()
            if not wl:
                wl = Watchlist(
                    plate_text=sveh["plate"],
                    reason=sveh["reason"],
                    priority=sveh["watchlist_priority"],
                    added_by=admin.id if admin else None,
                    active=True,
                    notes="Flagged in Sentinel Hackathon Demo Dataset"
                )
                db.add(wl)
                await db.flush()

            # Generate multi-stop journey for suspect
            journey_sightings = []
            for stop_seq, cam_idx in enumerate(sveh["route_indices"]):
                cam = cameras[cam_idx % len(cameras)]
                ts = now - timedelta(hours=6 - stop_seq) + timedelta(minutes=stop_seq * 35)

                fname = f"demo_{sveh['plate']}_{stop_seq}"
                frame_path = os.path.join(settings.MEDIA_ROOT, "frames", f"{fname}_frame.jpg")
                crop_path = os.path.join(settings.MEDIA_ROOT, "crops", f"{fname}_crop.jpg")
                plate_path = os.path.join(settings.MEDIA_ROOT, "plates", f"{fname}_plate.jpg")

                os.makedirs(os.path.dirname(frame_path), exist_ok=True)
                with open(frame_path, "wb") as f: f.write(dummy_frame)
                with open(crop_path, "wb") as f: f.write(dummy_crop)
                with open(plate_path, "wb") as f: f.write(dummy_plate)

                sighting = Sighting(
                    camera_id=cam.id,
                    plate_text=sveh["plate"],
                    plate_raw=sveh["plate"],
                    plate_conf=round(0.97 - (stop_seq * 0.015), 2),
                    vehicle_class=sveh["class"],
                    vehicle_conf=0.95,
                    track_id=1000 + stop_seq,
                    frame_ts=ts,
                    bbox_x=240 + stop_seq * 20,
                    bbox_y=300,
                    bbox_w=450,
                    bbox_h=300,
                    frame_path=frame_path,
                    crop_path=crop_path,
                    plate_crop_path=plate_path,
                    extra_metadata={"speed_kmh": 45 + stop_seq * 3, "lane": (stop_seq % 3) + 1}
                )
                db.add(sighting)
                journey_sightings.append(sighting)

            await db.flush()

            # Create Real-time Watchlist Alert for the latest stop
            alert = Alert(
                watchlist_id=wl.id,
                sighting_id=journey_sightings[-1].id,
                plate_text=sveh["plate"],
                camera_id=journey_sightings[-1].camera_id,
                triggered_at=journey_sightings[-1].frame_ts,
                status="active" if sveh["watchlist_priority"] in ["critical", "high"] else "acknowledged",
                priority=sveh["watchlist_priority"]
            )
            db.add(alert)
            await db.flush()

            # Preserve Evidence with SHA-256 Hashes
            meta = {
                "case_id": f"CASE-SENTINEL-2024-{sveh['plate'][:4]}",
                "plate_text": sveh["plate"],
                "camera_id": str(journey_sightings[-1].camera_id),
                "camera_name": cam.name,
                "timestamp": journey_sightings[-1].frame_ts.isoformat(),
                "ai_confidence": journey_sightings[-1].plate_conf,
                "vehicle_class": sveh["class"],
                "evidence_vault_status": "cryptographically_sealed",
                "hash_algorithm": "SHA-256"
            }
            meta_str = json.dumps(meta, sort_keys=True, indent=2)

            ev = Evidence(
                case_id=meta["case_id"],
                sighting_id=journey_sightings[-1].id,
                alert_id=alert.id,
                plate_text=sveh["plate"],
                camera_id=journey_sightings[-1].camera_id,
                frame_ts=journey_sightings[-1].frame_ts,
                frame_path=journey_sightings[-1].frame_path,
                vehicle_crop_path=journey_sightings[-1].crop_path,
                plate_crop_path=journey_sightings[-1].plate_crop_path,
                frame_hash=hashlib.sha256(dummy_frame).hexdigest().lower(),
                vehicle_hash=hashlib.sha256(dummy_crop).hexdigest().lower(),
                plate_hash=hashlib.sha256(dummy_plate).hexdigest().lower(),
                metadata_json=meta_str,
                metadata_hash=hashlib.sha256(meta_str.encode()).hexdigest().lower(),
                ai_confidence=journey_sightings[-1].plate_conf,
                ai_model_version="YOLOv8m+PaddleOCR",
                exported=False,
                created_at=now - timedelta(minutes=20)
            )
            db.add(ev)
            await db.flush()

            # Create Audit Log
            audit = AuditLog(
                user_id=admin.id if admin else None,
                action="preserve_evidence",
                target_type="evidence",
                target_id=ev.id,
                detail={"action": "Automatic Cryptographic Seal on Sentinel Alert Hit", "hash": ev.metadata_hash},
                created_at=now - timedelta(minutes=20)
            )
            db.add(audit)

            # Journey Correlation
            wkt_coords = ", ".join([f"{cameras[idx % len(cameras)].longitude} {cameras[idx % len(cameras)].latitude}" for idx in sveh["route_indices"]])
            corr = Correlation(
                plate_text=sveh["plate"],
                sighting_ids=[str(s.id) for s in journey_sightings],
                camera_ids=[str(s.camera_id) for s in journey_sightings],
                start_ts=journey_sightings[0].frame_ts,
                end_ts=journey_sightings[-1].frame_ts,
                duration_mins=round((journey_sightings[-1].frame_ts - journey_sightings[0].frame_ts).total_seconds() / 60.0, 1),
                correlation_method="plate_match",
                confidence=0.95,
                path_wkt=f"LINESTRING({wkt_coords})"
            )
            db.add(corr)

        # 2. General Commuter Traffic (50+ sightings across today)
        for plate, vclass, conf in COMMUTER_TRAFFIC:
            for k in range(5):
                cam_choice = cameras[(hash(plate) + k) % len(cameras)]
                s_ts = now - timedelta(hours=random.randint(1, 12), minutes=random.randint(5, 55))
                s = Sighting(
                    camera_id=cam_choice.id,
                    plate_text=plate,
                    plate_raw=plate,
                    plate_conf=conf,
                    vehicle_class=vclass,
                    vehicle_conf=0.93,
                    track_id=random.randint(200, 800),
                    frame_ts=s_ts,
                    bbox_x=random.randint(150, 300),
                    bbox_y=280,
                    bbox_w=420,
                    bbox_h=280,
                    extra_metadata={"speed_kmh": random.randint(30, 75)}
                )
                db.add(s)

        await db.commit()
        logger.info("Successfully added rich demo data with multiple suspects, journeys, alerts, and forensic packages!")

if __name__ == "__main__":
    asyncio.run(seed_rich_demo_data())
