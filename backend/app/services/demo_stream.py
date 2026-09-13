import asyncio
import random
import json
import hashlib
from datetime import datetime, timedelta
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.redis import get_redis
from app.models.camera import Camera
from app.models.watchlist import Watchlist
from app.models.sighting import Sighting
from app.models.alert import Alert
from app.models.evidence import Evidence
from app.core.logging import logger

DEMO_COMMUTERS = [
    ("GJ01AB1234", "car", 0.98, True, "critical", "Kidnapping & Extortion Syndicate Lead Vehicle (FIR 2024/098)"),
    ("RJ14GH3456", "car", 0.97, True, "critical", "Reported Stolen Luxury Fortuner - Armed Jewelry Heist"),
    ("UP32PQ6677", "truck", 0.92, True, "high", "Interstate Narcotics Trafficking Conduit"),
    ("GJ05CD5678", "car", 0.95, True, "high", "Fatal Hit & Run Collision on SG Highway"),
    ("MH12EF9012", "motorcycle", 0.94, False, "low", ""),
    ("GJ18IJ7890", "car", 0.97, False, "low", ""),
    ("DL3CKL2233", "bus", 0.91, False, "low", ""),
    ("GJ01MN4455", "car", 0.95, False, "low", ""),
    ("GJ09RS8899", "car", 0.92, False, "low", ""),
    ("HR26TU1122", "truck", 0.89, False, "low", ""),
    ("GJ27XY9900", "car", 0.98, False, "low", ""),
    ("GJ06ZA1010", "car", 0.93, False, "low", ""),
    ("GJ03BC4040", "motorcycle", 0.90, False, "low", ""),
    ("MH04DE8080", "truck", 0.95, False, "low", ""),
    ("GJ01KK5544", "car", 0.96, False, "low", ""),
    ("GJ02AA8811", "car", 0.94, False, "low", ""),
    ("GJ18ZZ3322", "car", 0.95, False, "low", ""),
    ("RJ19BB7766", "bus", 0.92, False, "low", ""),
    ("GJ05MM2211", "car", 0.97, False, "low", ""),
    ("MH47LL9988", "truck", 0.91, False, "low", ""),
    ("DL8CBB4411", "car", 0.93, False, "low", ""),
    ("GJ01TT6655", "motorcycle", 0.94, False, "low", ""),
]

last_alert_time = datetime.min

async def live_demo_generator_loop():
    """Continuously emits real-time CCTV detections and occasional watchlist hits."""
    global last_alert_time
    logger.info("Starting SENTRAX Live CCTV Intelligence Stream Simulator...")
    await asyncio.sleep(5)

    while True:
        try:
            async with AsyncSessionLocal() as db:
                cams_res = await db.execute(select(Camera).where(Camera.status.in_(["online", "warning"])))
                cameras = cams_res.scalars().all()
                if not cameras:
                    await asyncio.sleep(4)
                    continue

                # Pick random camera and vehicle
                camera = random.choice(cameras)
                now = datetime.utcnow()

                # Choose vehicle: 95% regular commuters, 5% watchlist
                can_trigger_alert = (now - last_alert_time).total_seconds() > 45.0
                if can_trigger_alert and random.random() < 0.12:
                    candidates = [c for c in DEMO_COMMUTERS if c[3]]
                else:
                    candidates = [c for c in DEMO_COMMUTERS if not c[3]]
                
                veh_tuple = random.choice(candidates)
                v_plate, v_class, v_conf, is_wl, v_prio, v_reason = veh_tuple

                # Dynamic randomized bounding box
                bx = random.randint(120, 380)
                by = random.randint(180, 260)
                bw = random.randint(280, 420)
                bh = random.randint(180, 260)

                # Generate real surveillance frame and plate crop on disk
                import cv2
                import numpy as np
                import uuid
                import os
                from app.core.config import settings

                file_prefix = f"{now.strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
                frame_full = os.path.join(settings.MEDIA_ROOT, "frames", f"{file_prefix}_frame.jpg")
                crop_full = os.path.join(settings.MEDIA_ROOT, "crops", f"{file_prefix}_vehicle.jpg")
                plate_full = os.path.join(settings.MEDIA_ROOT, "plates", f"{file_prefix}_plate.jpg")

                # Synthetic high-resolution surveillance frame
                synth_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
                cv2.rectangle(synth_frame, (0, 0), (1280, 720), (25, 30, 40), -1)
                # Road marking
                cv2.line(synth_frame, (0, 500), (1280, 500), (60, 70, 85), 3)
                # Vehicle body in bounding box
                cv2.rectangle(synth_frame, (bx, by), (bx + bw, by + bh), (40, 60, 90), -1)
                cv2.rectangle(synth_frame, (bx, by), (bx + bw, by + bh), (0, 200, 117), 2)
                # License plate region
                p_w, p_h = int(bw * 0.45), int(bh * 0.22)
                px = bx + int((bw - p_w) / 2)
                py = by + int(bh * 0.65)
                cv2.rectangle(synth_frame, (px, py), (px + p_w, py + p_h), (240, 240, 240), -1)
                cv2.rectangle(synth_frame, (px, py), (px + p_w, py + p_h), (0, 0, 0), 2)
                cv2.putText(synth_frame, v_plate, (px + 6, py + int(p_h * 0.75)), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 0, 0), 2)

                # Crops
                veh_crop = synth_frame[by:by+bh, bx:bx+bw]
                plate_crop = synth_frame[py:py+p_h, px:px+p_w]

                try:
                    cv2.imwrite(frame_full, synth_frame)
                    cv2.imwrite(crop_full, veh_crop)
                    cv2.imwrite(plate_full, plate_crop)
                except Exception as img_err:
                    logger.warning(f"Could not write synthetic image crops: {img_err}")

                # 1. Create Sighting in DB with real image file paths
                sighting = Sighting(
                    camera_id=camera.id,
                    plate_text=v_plate,
                    plate_raw=v_plate,
                    plate_conf=v_conf,
                    vehicle_class=v_class,
                    vehicle_conf=round(random.uniform(0.91, 0.98), 2),
                    track_id=random.randint(100, 999),
                    frame_ts=now,
                    bbox_x=bx,
                    bbox_y=by,
                    bbox_w=bw,
                    bbox_h=bh,
                    frame_path=f"/media/frames/{file_prefix}_frame.jpg",
                    crop_path=f"/media/crops/{file_prefix}_vehicle.jpg",
                    plate_crop_path=f"/media/plates/{file_prefix}_plate.jpg",
                    extra_metadata={"speed_kmh": random.randint(38, 78), "lane": random.randint(1, 4)}
                )
                db.add(sighting)
                await db.flush()

                alert_record = None
                # If watchlist vehicle and alert throttling permits
                if is_wl and can_trigger_alert:
                    last_alert_time = now
                    wl_res = await db.execute(select(Watchlist).where(Watchlist.plate_text == v_plate))
                    wl_entry = wl_res.scalar_one_or_none()
                    
                    alert_record = Alert(
                        watchlist_id=wl_entry.id if wl_entry else None,
                        sighting_id=sighting.id,
                        plate_text=v_plate,
                        camera_id=camera.id,
                        triggered_at=now,
                        status="active",
                        priority=v_prio
                    )
                    db.add(alert_record)
                    await db.flush()

                    # Preserve Evidence record with SHA-256 hashes
                    try:
                        with open(frame_full, "rb") as f_b:
                            f_hash = hashlib.sha256(f_b.read()).hexdigest()
                        with open(crop_full, "rb") as c_b:
                            c_hash = hashlib.sha256(c_b.read()).hexdigest()
                        with open(plate_full, "rb") as p_b:
                            p_hash = hashlib.sha256(p_b.read()).hexdigest()

                        evidence = Evidence(
                            case_id=f"CASE-GJ-{v_plate[:4]}",
                            sighting_id=sighting.id,
                            alert_id=alert_record.id,
                            plate_text=v_plate,
                            camera_id=camera.id,
                            frame_ts=now,
                            frame_path=f"/media/frames/{file_prefix}_frame.jpg",
                            vehicle_crop_path=f"/media/crops/{file_prefix}_vehicle.jpg",
                            plate_crop_path=f"/media/plates/{file_prefix}_plate.jpg",
                            frame_hash=f_hash,
                            vehicle_hash=c_hash,
                            plate_hash=p_hash,
                            metadata_json=json.dumps({"plate": v_plate, "reason": v_reason, "camera": camera.name}),
                            metadata_hash=hashlib.sha256(v_plate.encode()).hexdigest(),
                            ai_confidence=v_conf,
                            ai_model_version="YOLOv8n+PaddleOCR",
                            exported=False
                        )
                        db.add(evidence)
                    except Exception as ev_err:
                        logger.warning(f"Could not create evidence record: {ev_err}")

                await db.commit()

                # 2. Broadcast via Redis to all connected WebSockets
                redis = await get_redis()
                if redis:
                    event_payload = {
                        "type": "sighting",
                        "payload": {
                            "sighting_id": str(sighting.id),
                            "camera_id": str(camera.id),
                            "camera_identifier": camera.camera_id,
                            "camera_name": camera.name,
                            "location_name": camera.location_name,
                            "plate_text": v_plate,
                            "plate_conf": v_conf,
                            "vehicle_class": v_class,
                            "timestamp": now.isoformat(),
                            "bbox": [bx, by, bw, bh],
                            "crop_url": f"/media/crops/{file_prefix}_vehicle.jpg",
                            "plate_url": f"/media/plates/{file_prefix}_plate.jpg"
                        }
                    }
                    await redis.publish("monitor_channel", json.dumps(event_payload))

                    if alert_record:
                        alert_payload = {
                            "type": "alert",
                            "payload": {
                                "id": str(alert_record.id),
                                "watchlist_id": str(alert_record.watchlist_id) if alert_record.watchlist_id else None,
                                "sighting_id": str(sighting.id),
                                "plate_text": v_plate,
                                "plate_conf": v_conf,
                                "camera_id": str(camera.id),
                                "camera_name": camera.name,
                                "camera_identifier": camera.camera_id,
                                "location_name": camera.location_name,
                                "triggered_at": now.isoformat(),
                                "status": "active",
                                "priority": v_prio,
                                "watchlist_reason": v_reason or "Watchlist Target Detected",
                                "crop_url": f"/media/crops/{file_prefix}_vehicle.jpg",
                                "plate_url": f"/media/plates/{file_prefix}_plate.jpg"
                            }
                        }
                        await redis.publish("alerts_channel", json.dumps(alert_payload))
                        await redis.publish("monitor_channel", json.dumps(alert_payload))

        except Exception as e:
            logger.warning(f"Demo generator error: {e}")

        await asyncio.sleep(random.uniform(4.0, 7.0))
