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

SUSPECT_PROFILES = [
    {
        "plate": "GJ01AB1234",
        "class": "car",
        "priority": "critical",
        "reason": "Kidnapping & Extortion Syndicate Lead Vehicle (FIR 2024/098 Ahmedabad Crime Branch)",
        "color": "Black",
        "route_indices": [0, 1, 2, 3, 5, 7, 8, 9]
    },
    {
        "plate": "RJ14GH3456",
        "class": "car",
        "priority": "critical",
        "reason": "Reported Stolen Luxury Fortuner - Armed Jewelry Heist (FIR 2024/112)",
        "color": "White",
        "route_indices": [4, 6, 7, 8, 9]
    },
    {
        "plate": "UP32PQ6677",
        "class": "truck",
        "priority": "high",
        "reason": "Interstate Narcotics Trafficking Conduit (Special Narcotics Task Force Warrant)",
        "color": "Yellow",
        "route_indices": [3, 4, 8, 9]
    },
    {
        "plate": "GJ05CD5678",
        "class": "car",
        "priority": "high",
        "reason": "Hit & Run Fatal Accident on SG Highway Corridor (Accident Case 2024/405)",
        "color": "Silver",
        "route_indices": [0, 2, 3, 6]
    },
    {
        "plate": "DL10XY9090",
        "class": "car",
        "priority": "high",
        "reason": "Syndicate Convoy Lead - Escorting Unmarked Contraband Van",
        "color": "Dark Blue",
        "route_indices": [1, 3, 5, 8]
    },
    {
        "plate": "MH02KL8822",
        "class": "truck",
        "priority": "medium",
        "reason": "Toll Gate Evasion & Forged FASTag Syndicate (NHAI Toll Enforcement Alert)",
        "color": "Brown",
        "route_indices": [3, 4, 7, 9]
    },
    {
        "plate": "GJ27BB4433",
        "class": "motorcycle",
        "priority": "medium",
        "reason": "Chain Snatching & Mobile Theft Tandem (Sector 15 Police Station Alert)",
        "color": "Black",
        "route_indices": [0, 1, 6, 7]
    },
    {
        "plate": "GJ06MN1100",
        "class": "car",
        "priority": "low",
        "reason": "Expired Commercial Fitness & Outstanding Municipal Tax Defaults",
        "color": "White",
        "route_indices": [2, 4, 8]
    }
]

COMMUTER_POOL = [
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
    ("GJ01KK5544", "car", 0.96),
    ("GJ02AA8811", "car", 0.94),
    ("GJ18ZZ3322", "car", 0.95),
    ("RJ19BB7766", "bus", 0.92),
    ("GJ05MM2211", "car", 0.97),
    ("MH47LL9988", "truck", 0.91),
    ("DL8CBB4411", "car", 0.93),
    ("GJ01TT6655", "motorcycle", 0.94),
]

VIDEO_SOURCES = [
    "/media/videos/traffic_cctv_real.mp4",
    "/media/videos/traffic_city_junction.mp4",
    "/media/videos/cam_feed_ahmedabad.mp4"
]

async def seed_massive_intel():
    logger.info("Seeding Massive Intelligence Dataset for SENTRAX...")
    async with AsyncSessionLocal() as db:
        admin_res = await db.execute(select(User).where(User.username == "admin"))
        admin = admin_res.scalar_one_or_none()

        cams_res = await db.execute(select(Camera).order_by(Camera.camera_id))
        cameras = cams_res.scalars().all()
        if not cameras:
            logger.error("No cameras found!")
            return

        # 1. Update Camera video sources
        for idx, cam in enumerate(cameras):
            cam.hls_url = VIDEO_SOURCES[idx % len(VIDEO_SOURCES)]
            cam.status = "online"
            cam.resolution = "1920x1080"
            cam.fps = 30
            db.add(cam)
        await db.flush()

        now = datetime.utcnow()
        dummy_frame = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 4096 + b"\xFF\xD9"
        dummy_crop = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x01" * 2048 + b"\xFF\xD9"
        dummy_plate = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x02" * 1024 + b"\xFF\xD9"

        # 2. Seed Watchlist Targets
        watchlist_map = {}
        for sp in SUSPECT_PROFILES:
            wl_res = await db.execute(select(Watchlist).where(Watchlist.plate_text == sp["plate"]))
            wl = wl_res.scalar_one_or_none()
            if not wl:
                wl = Watchlist(
                    plate_text=sp["plate"],
                    reason=sp["reason"],
                    priority=sp["priority"],
                    added_by=admin.id if admin else None,
                    active=True,
                    notes=f"Flagged in Gujarat Police Live CCTV Grid ({sp['color']})"
                )
                db.add(wl)
                await db.flush()
            else:
                wl.priority = sp["priority"]
                wl.reason = sp["reason"]
                wl.active = True
                db.add(wl)
            watchlist_map[sp["plate"]] = wl

        # 3. Seed Suspect Sightings across time windows (Multi-day journeys)
        for sp in SUSPECT_PROFILES:
            wl = watchlist_map.get(sp["plate"])
            route = sp["route_indices"]
            # Create a multi-pass journey (yesterday and today)
            for pass_idx in range(2):
                base_time = now - timedelta(hours=36 - (pass_idx * 18))
                for stop_seq, cam_idx in enumerate(route):
                    cam = cameras[cam_idx % len(cameras)]
                    ts = base_time + timedelta(minutes=stop_seq * 26 + random.randint(-3, 3))
                    speed = random.randint(44, 92)

                    fname = f"intel_{sp['plate']}_p{pass_idx}_s{stop_seq}"
                    frame_path = os.path.join(settings.MEDIA_ROOT, "frames", f"{fname}_frame.jpg")
                    crop_path = os.path.join(settings.MEDIA_ROOT, "crops", f"{fname}_crop.jpg")
                    plate_path = os.path.join(settings.MEDIA_ROOT, "plates", f"{fname}_plate.jpg")

                    os.makedirs(os.path.dirname(frame_path), exist_ok=True)
                    with open(frame_path, "wb") as f: f.write(dummy_frame)
                    with open(crop_path, "wb") as f: f.write(dummy_crop)
                    with open(plate_path, "wb") as f: f.write(dummy_plate)

                    sighting = Sighting(
                        camera_id=cam.id,
                        plate_text=sp["plate"],
                        plate_raw=sp["plate"],
                        plate_conf=round(random.uniform(0.92, 0.99), 2),
                        vehicle_class=sp["class"],
                        vehicle_conf=0.96,
                        track_id=1000 + stop_seq * 10 + pass_idx,
                        frame_ts=ts,
                        bbox_x=120,
                        bbox_y=140,
                        bbox_w=200,
                        bbox_h=180,
                        frame_path=f"/media/frames/{fname}_frame.jpg",
                        crop_path=f"/media/crops/{fname}_crop.jpg",
                        plate_crop_path=f"/media/plates/{fname}_plate.jpg",
                        extra_metadata={
                            "speed_kmh": speed,
                            "vehicle_color": sp["color"],
                            "lane": random.randint(1, 3),
                            "heading": "North-East"
                        }
                    )
                    db.add(sighting)
                    await db.flush()

                    # Create corresponding Alert
                    alert_time = ts + timedelta(seconds=1)
                    alert_status = "acknowledged" if pass_idx == 0 else ("active" if stop_seq > len(route) - 3 else "acknowledged")
                    alert = Alert(
                        watchlist_id=wl.id if wl else None,
                        sighting_id=sighting.id,
                        camera_id=cam.id,
                        plate_text=sp["plate"],
                        priority=sp["priority"],
                        status=alert_status,
                        triggered_at=alert_time,
                        acknowledged_by=admin.id if alert_status == "acknowledged" and admin else None,
                        acknowledged_at=alert_time + timedelta(minutes=2) if alert_status == "acknowledged" else None
                    )
                    db.add(alert)

        # 4. Seed Commuter High-Volume Sightings (Past 48 hours)
        for i in range(250):
            plate, vclass, conf = random.choice(COMMUTER_POOL)
            cam = random.choice(cameras)
            offset_minutes = random.randint(5, 2880)
            ts = now - timedelta(minutes=offset_minutes)

            fname = f"commuter_{i}"
            sighting = Sighting(
                camera_id=cam.id,
                plate_text=plate,
                plate_raw=plate,
                plate_conf=conf,
                vehicle_class=vclass,
                vehicle_conf=0.92,
                track_id=2000 + i,
                frame_ts=ts,
                bbox_x=100 + (i % 150),
                bbox_y=120 + (i % 80),
                bbox_w=180,
                bbox_h=160,
                frame_path=f"/media/frames/demo_{plate}_0_frame.jpg",
                crop_path=f"/media/crops/demo_{plate}_0_crop.jpg",
                plate_crop_path=f"/media/plates/demo_{plate}_0_plate.jpg",
                extra_metadata={
                    "speed_kmh": random.randint(35, 75),
                    "vehicle_color": random.choice(["White", "Silver", "Grey", "Blue", "Red"]),
                    "lane": random.randint(1, 3)
                }
            )
            db.add(sighting)

        # 5. Seed Cryptographic Evidence Locker Packages
        evidence_data = [
            ("GJ01AB1234", "Master Surveillance Dossier: Kidnapping Syndicate Route Reconstruction", "FIR 2024/098", 0.98),
            ("RJ14GH3456", "Forensic CCTV Bundle: Armed Robbery Getaway Telemetry", "FIR 2024/112", 0.96),
            ("UP32PQ6677", "Narcotics Task Force Corridor Log: Inter-State Transport", "NDPS-014", 0.94),
            ("GJ05CD5678", "Fatal Hit & Run Collision ANPR Sequence & Speed Vectors", "ACC-405", 0.95),
            ("DL10XY9090", "Syndicate Convoy Shadowing & Decoy Telemetry Analysis", "FIR-204", 0.97),
            ("MH02KL8822", "NHAI Automated Toll Evasion Video Archive & FASTag Fraud Audit", "NHAI-W7", 0.91),
            ("GJ27BB4433", "Repeat Snatching Grid Detection Timestamps", "CR-55", 0.93),
            ("GJ01AB1234", "Section 65B Certified Forensic Extraction (Trial Ready)", "SESS-01", 0.99),
        ]

        for plate, title, case_ref, conf in evidence_data:
            sha256_frame = hashlib.sha256(f"frame:{plate}:{case_ref}".encode()).hexdigest()
            sha256_veh = hashlib.sha256(f"veh:{plate}:{case_ref}".encode()).hexdigest()
            sha256_plate = hashlib.sha256(f"plate:{plate}:{case_ref}".encode()).hexdigest()
            meta = {
                "target_plate": plate,
                "title": title,
                "case_number": case_ref,
                "verified_algorithm": "SHA-256",
                "legal_compliance": "Section 65B Indian Evidence Act, 1872 / Section 63 BSA 2023",
                "custody_officer": "Inspector V. K. Jadeja, Cyber & Forensics Division",
                "hash_signature": sha256_frame,
                "capture_grid": "Ahmedabad-Gandhinagar ANPR Integrated Network"
            }
            meta_json = json.dumps(meta)
            meta_hash = hashlib.sha256(meta_json.encode()).hexdigest()

            ev = Evidence(
                case_id=case_ref,
                plate_text=plate,
                camera_id=cameras[0].id,
                frame_ts=now - timedelta(hours=random.randint(2, 24)),
                frame_path=f"/media/frames/intel_{plate}_p1_s0_frame.jpg",
                vehicle_crop_path=f"/media/crops/intel_{plate}_p1_s0_crop.jpg",
                plate_crop_path=f"/media/plates/intel_{plate}_p1_s0_plate.jpg",
                frame_hash=sha256_frame,
                vehicle_hash=sha256_veh,
                plate_hash=sha256_plate,
                metadata_json=meta_json,
                metadata_hash=meta_hash,
                ai_confidence=conf,
                ai_model_version="YOLOv8x+PaddleOCR-v4",
                exported=True,
                created_at=now - timedelta(hours=random.randint(1, 12))
            )
            db.add(ev)

        # 6. Seed Forensic Audit Logs
        for act, target_t, detail_text in [
            ("CASE_EXPORT", "evidence", "Exported Section 65B electronic certificate for FIR 2024/098"),
            ("WATCHLIST_ADD", "watchlist", "Target vehicle GJ01AB1234 added with CRITICAL priority"),
            ("HASH_VERIFICATION", "evidence", "Evidence package SHA-256 integrity check PASSED"),
            ("SPEED_ANOMALY", "sighting", "Transit anomaly detected between CAM02 and CAM03 (+18% over average)"),
            ("ALERT_DISPATCH", "sighting", "Tactical interception dispatch notification sent to Kudasan Checkpost"),
        ]:
            audit = AuditLog(
                user_id=admin.id if admin else None,
                action=act,
                target_type=target_t,
                detail={"summary": detail_text},
                ip_address="127.0.0.1"
            )
            db.add(audit)

        await db.commit()
        logger.info("Massive Intelligence Dataset seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_massive_intel())
