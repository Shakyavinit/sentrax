import asyncio
import os
import uuid
import json
import hashlib
from datetime import datetime, timedelta
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.user import User
from app.models.camera import Camera
from app.models.watchlist import Watchlist
from app.models.sighting import Sighting
from app.models.alert import Alert
from app.models.evidence import Evidence
from app.models.correlation import Correlation
from app.models.audit import AuditLog
from app.core.logging import logger

MOCK_CAMERAS = [
    {"camera_id": "CAM01", "name": "MG Road Junction", "location_name": "MG Road Junction, Ahmedabad", "lat": 23.0258, "lon": 72.5839},
    {"camera_id": "CAM02", "name": "Sardar Bridge Entry", "location_name": "Sardar Bridge Entry, Ahmedabad", "lat": 23.0152, "lon": 72.5794},
    {"camera_id": "CAM03", "name": "Vastrapur Lake Gate", "location_name": "Vastrapur Lake Gate, Ahmedabad", "lat": 23.0436, "lon": 72.5283},
    {"camera_id": "CAM04", "name": "SG Highway Toll", "location_name": "SG Highway Toll, Gandhinagar", "lat": 23.0732, "lon": 72.5038},
    {"camera_id": "CAM05", "name": "Gandhinagar Sector 15", "location_name": "Gandhinagar Sector 15, Gandhinagar", "lat": 23.2156, "lon": 72.6394},
    {"camera_id": "CAM06", "name": "GIFT City Entry", "location_name": "GIFT City Entry, Gandhinagar", "lat": 23.1573, "lon": 72.6787},
    {"camera_id": "CAM07", "name": "Sabarmati Riverfront", "location_name": "Sabarmati Riverfront, Ahmedabad", "lat": 23.0395, "lon": 72.5878},
    {"camera_id": "CAM08", "name": "GNLU Gate", "location_name": "GNLU Gate, Gandhinagar", "lat": 23.1891, "lon": 72.6542},
    {"camera_id": "CAM09", "name": "Chiloda Circle", "location_name": "Chiloda Circle, Gandhinagar", "lat": 23.2743, "lon": 72.6122},
    {"camera_id": "CAM10", "name": "Kudasan Junction", "location_name": "Kudasan Junction, Gandhinagar", "lat": 23.2264, "lon": 72.6511},
]

MOCK_WATCHLIST = [
    {"plate": "GJ01AB1234", "priority": "high", "reason": "Suspected vehicle in financial fraud investigation (FIR 2024/098)"},
    {"plate": "RJ14GH3456", "priority": "critical", "reason": "Reported stolen luxury SUV - armed robbery involvement"},
    {"plate": "UP32PQ6677", "priority": "medium", "reason": "Vehicle flagged for repeated toll gate evasion and traffic warrants"},
]

CLEAN_PLATES = [
    "GJ05CD5678", "MH12EF9012", "GJ18IJ7890", "DL3CKL2233",
    "GJ01MN4455", "GJ09RS8899", "HR26TU1122"
]

def make_dummy_file(path: str, content: bytes):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        with open(path, "wb") as f:
            f.write(content)

async def seed_database():
    logger.info("Starting database seeder...")
    async with AsyncSessionLocal() as db:
        # 1. Admin User
        admin_res = await db.execute(select(User).where(User.username == settings.DEFAULT_ADMIN_USERNAME))
        admin = admin_res.scalar_one_or_none()
        if not admin:
            admin = User(
                username=settings.DEFAULT_ADMIN_USERNAME,
                email="admin@sentrax.gov.in",
                password_hash=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                role="admin",
                is_active=True
            )
            db.add(admin)
            await db.flush()

        op_res = await db.execute(select(User).where(User.username == "operator1"))
        operator = op_res.scalar_one_or_none()
        if not operator:
            operator = User(
                username="operator1",
                email="op1@sentrax.gov.in",
                password_hash=get_password_hash("OperatorPass2024!"),
                role="operator",
                is_active=True
            )
            db.add(operator)
            await db.flush()

        # 2. Cameras
        db_cameras = []
        for i, c_data in enumerate(MOCK_CAMERAS):
            c_res = await db.execute(select(Camera).where(Camera.camera_id == c_data["camera_id"]))
            cam = c_res.scalar_one_or_none()
            if not cam:
                cam = Camera(
                    camera_id=c_data["camera_id"],
                    name=c_data["name"],
                    location_name=c_data["location_name"],
                    latitude=c_data["lat"],
                    longitude=c_data["lon"],
                    rtsp_url=settings.SANDBOX_RTSP_URL,
                    hls_url=settings.SANDBOX_HLS_URL,
                    protocol="hls" if i % 2 == 0 else "rtsp",
                    codec="h264",
                    resolution="1920x1080",
                    fps=25,
                    status="online" if i < 9 else "warning",
                    last_seen=datetime.utcnow() - timedelta(minutes=i*2)
                )
                db.add(cam)
                await db.flush()
            db_cameras.append(cam)

        # 3. Watchlist
        db_watchlist = []
        for w_data in MOCK_WATCHLIST:
            w_res = await db.execute(select(Watchlist).where(Watchlist.plate_text == w_data["plate"]))
            wl = w_res.scalar_one_or_none()
            if not wl:
                wl = Watchlist(
                    plate_text=w_data["plate"],
                    reason=w_data["reason"],
                    priority=w_data["priority"],
                    added_by=admin.id,
                    active=True,
                    notes="Verified via central police database"
                )
                db.add(wl)
                await db.flush()
            db_watchlist.append(wl)

        dummy_frame = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 2048 + b"\xFF\xD9"
        dummy_crop = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x01" * 1024 + b"\xFF\xD9"
        dummy_plate = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x02" * 512 + b"\xFF\xD9"

        now = datetime.utcnow()

        # 4. Generate multi-camera journey for Watchlist Plate 1: GJ01AB1234
        target_plate = "GJ01AB1234"
        journey_cameras = [db_cameras[0], db_cameras[1], db_cameras[2], db_cameras[3], db_cameras[5]]
        journey_sightings = []

        # Check if already seeded
        s_res = await db.execute(select(Sighting).where(Sighting.plate_text == target_plate))
        existing_s = s_res.scalars().all()
        if not existing_s:
            for idx, cam in enumerate(journey_cameras):
                ts = now - timedelta(hours=5) + timedelta(minutes=idx * 28)
                fname = f"sample_{target_plate}_{idx}"
                frame_path = os.path.join(settings.MEDIA_ROOT, "frames", f"{fname}_frame.jpg")
                crop_path = os.path.join(settings.MEDIA_ROOT, "crops", f"{fname}_crop.jpg")
                plate_path = os.path.join(settings.MEDIA_ROOT, "plates", f"{fname}_plate.jpg")

                make_dummy_file(frame_path, dummy_frame)
                make_dummy_file(crop_path, dummy_crop)
                make_dummy_file(plate_path, dummy_plate)

                sighting = Sighting(
                    camera_id=cam.id,
                    plate_text=target_plate,
                    plate_raw=target_plate,
                    plate_conf=0.96 - (idx * 0.02),
                    vehicle_class="car",
                    vehicle_conf=0.94,
                    track_id=101 + idx,
                    frame_ts=ts,
                    bbox_x=220 + idx * 10,
                    bbox_y=310,
                    bbox_w=480,
                    bbox_h=320,
                    frame_path=frame_path,
                    crop_path=crop_path,
                    plate_crop_path=plate_path
                )
                db.add(sighting)
                journey_sightings.append(sighting)

            await db.flush()

            # 5. Alerts for Watchlist Hits
            alert1 = Alert(
                watchlist_id=db_watchlist[0].id,
                sighting_id=journey_sightings[-1].id,
                plate_text=target_plate,
                camera_id=journey_cameras[-1].id,
                triggered_at=journey_sightings[-1].frame_ts,
                status="active",
                priority=db_watchlist[0].priority
            )
            db.add(alert1)
            await db.flush()

            # 6. Preserved Evidence for Alert 1
            meta_dict = {
                "case_id": "CASE-GJ-2024-881",
                "plate_text": target_plate,
                "camera_id": str(journey_cameras[-1].id),
                "camera_identifier": journey_cameras[-1].camera_id,
                "camera_name": journey_cameras[-1].name,
                "location": journey_cameras[-1].location_name,
                "frame_timestamp": journey_sightings[-1].frame_ts.isoformat(),
                "ai_confidence": journey_sightings[-1].plate_conf,
                "vehicle_class": journey_sightings[-1].vehicle_class,
                "bbox": [260, 310, 480, 320],
                "ai_model": "YOLOv8+PaddleOCR",
                "preserved_at": now.isoformat()
            }
            meta_json = json.dumps(meta_dict, sort_keys=True, indent=2)

            evidence1 = Evidence(
                case_id="CASE-GJ-2024-881",
                sighting_id=journey_sightings[-1].id,
                alert_id=alert1.id,
                plate_text=target_plate,
                camera_id=journey_cameras[-1].id,
                frame_ts=journey_sightings[-1].frame_ts,
                frame_path=journey_sightings[-1].frame_path,
                vehicle_crop_path=journey_sightings[-1].crop_path,
                plate_crop_path=journey_sightings[-1].plate_crop_path,
                frame_hash=hashlib.sha256(dummy_frame).hexdigest().lower(),
                vehicle_hash=hashlib.sha256(dummy_crop).hexdigest().lower(),
                plate_hash=hashlib.sha256(dummy_plate).hexdigest().lower(),
                metadata_json=meta_json,
                metadata_hash=hashlib.sha256(meta_json.encode()).hexdigest().lower(),
                ai_confidence=0.92,
                ai_model_version="YOLOv8+PaddleOCR",
                exported=False,
                created_at=now - timedelta(minutes=15)
            )
            db.add(evidence1)
            await db.flush()

            audit1 = AuditLog(
                user_id=admin.id,
                action="preserve_evidence",
                target_type="evidence",
                target_id=evidence1.id,
                detail={"reason": "Automatic preservation on watchlist trigger"},
                created_at=now - timedelta(minutes=15)
            )
            db.add(audit1)

            # 7. Journey Correlation
            corr = Correlation(
                plate_text=target_plate,
                sighting_ids=[str(s.id) for s in journey_sightings],
                camera_ids=[str(s.camera_id) for s in journey_sightings],
                start_ts=journey_sightings[0].frame_ts,
                end_ts=journey_sightings[-1].frame_ts,
                duration_mins=round((journey_sightings[-1].frame_ts - journey_sightings[0].frame_ts).total_seconds() / 60.0, 1),
                correlation_method="plate_match",
                confidence=0.93,
                path_wkt="LINESTRING(72.5839 23.0258, 72.5794 23.0152, 72.5283 23.0436, 72.5038 23.0732, 72.6787 23.1573)"
            )
            db.add(corr)

            # 8. Extra Sightings across the other plates and cameras
            for plate in CLEAN_PLATES:
                for k in range(3):
                    cam_choice = db_cameras[(hash(plate) + k) % len(db_cameras)]
                    s_ts = now - timedelta(hours=1 + k*3, minutes=int(hash(plate) % 50))
                    s = Sighting(
                        camera_id=cam_choice.id,
                        plate_text=plate,
                        plate_raw=plate,
                        plate_conf=0.88 + (k * 0.03),
                        vehicle_class="car" if k % 2 == 0 else "truck",
                        vehicle_conf=0.91,
                        track_id=200 + k,
                        frame_ts=s_ts,
                        bbox_x=180,
                        bbox_y=240,
                        bbox_w=400,
                        bbox_h=280
                    )
                    db.add(s)

        await db.commit()
        logger.info("Successfully seeded database with users, cameras, watchlist, sightings, alerts, and evidence!")

if __name__ == "__main__":
    asyncio.run(seed_database())
