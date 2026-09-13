import os
import uuid
import cv2
import numpy as np
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.ai.detector import detector
from app.ai.anpr import anpr_pipeline
from app.ai.tracker import tracker
from app.models.sighting import Sighting
from app.services.alert_service import trigger_alert_if_watchlist
from app.core.redis import publish_event

async def process_frame(
    frame: np.ndarray,
    camera_id: uuid.UUID,
    camera_identifier: str,
    timestamp: datetime,
    db: AsyncSession,
    mock_plate: Optional[str] = None
) -> Optional[Sighting]:
    """
    Complete AI frame processing pipeline:
    1. Vehicle Detection (YOLOv8)
    2. DeepSORT / centroid tracking
    3. ROI crop
    4. ANPR (PaddleOCR + Indian format validation)
    5. Save crops and sighting to DB
    6. Check Watchlist
    7. Broadcast to Live Monitor WebSocket
    """
    detections = detector.detect(frame)
    if not detections:
        return None

    best_det = detections[0]
    x, y, w, h = best_det.bbox
    fh, fw = frame.shape[:2]
    
    # Clip coordinates
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(fw, x + w), min(fh, y + h)
    
    vehicle_crop = frame[y1:y2, x1:x2]
    track_id = tracker.update(best_det.bbox, best_det.confidence, frame)
    plate_res = anpr_pipeline.read_plate(vehicle_crop, default_plate=mock_plate)

    # Save images
    file_prefix = f"{timestamp.strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
    frame_rel_path = f"/media/frames/{file_prefix}_frame.jpg"
    crop_rel_path = f"/media/crops/{file_prefix}_vehicle.jpg"
    plate_rel_path = f"/media/plates/{file_prefix}_plate.jpg"

    frame_full_path = os.path.join(settings.MEDIA_ROOT, "frames", f"{file_prefix}_frame.jpg")
    crop_full_path = os.path.join(settings.MEDIA_ROOT, "crops", f"{file_prefix}_vehicle.jpg")
    plate_full_path = os.path.join(settings.MEDIA_ROOT, "plates", f"{file_prefix}_plate.jpg")

    try:
        os.makedirs(os.path.join(settings.MEDIA_ROOT, "metadata"), exist_ok=True)
        meta_full_path = os.path.join(settings.MEDIA_ROOT, "metadata", f"{file_prefix}_meta.json")
        cv2.imwrite(frame_full_path, frame)
        if vehicle_crop.size > 0:
            cv2.imwrite(crop_full_path, vehicle_crop)
        if plate_res.crop is not None and plate_res.crop.size > 0:
            cv2.imwrite(plate_full_path, plate_res.crop)

        # Forensic metadata event archiving with provenance tagging
        provenance = "OFFICIAL_SENTINEL_LIVE" if "sentinel" in camera_identifier.lower() else "LOCAL_VALIDATION_SOURCE"
        meta_payload = {
            "event_prefix": file_prefix,
            "timestamp": timestamp.isoformat(),
            "camera_id": str(camera_id),
            "camera_identifier": camera_identifier,
            "provenance": provenance,
            "bbox": [x, y, w, h],
            "vehicle_class": best_det.class_name,
            "vehicle_confidence": float(best_det.confidence),
            "plate_text": plate_res.text,
            "plate_confidence": float(plate_res.confidence),
            "is_valid_format": plate_res.is_valid_format,
            "frame_path": frame_rel_path,
            "crop_path": crop_rel_path,
            "plate_path": plate_rel_path
        }
        import json
        with open(meta_full_path, "w") as mf:
            json.dump(meta_payload, mf, indent=2)
    except Exception as e:
        logger.warning(f"Error saving sighting images/metadata to disk: {e}")

    sighting = Sighting(
        camera_id=camera_id,
        plate_text=plate_res.text,
        plate_raw=plate_res.raw_text,
        plate_conf=plate_res.confidence,
        vehicle_class=best_det.class_name,
        vehicle_conf=best_det.confidence,
        track_id=track_id,
        frame_ts=timestamp,
        bbox_x=x,
        bbox_y=y,
        bbox_w=w,
        bbox_h=h,
        frame_path=frame_full_path,
        crop_path=crop_full_path,
        plate_crop_path=plate_full_path,
        extra_metadata={"is_valid_plate": plate_res.is_valid_format}
    )
    db.add(sighting)
    await db.commit()
    await db.refresh(sighting)

    # Check Watchlist
    alert = await trigger_alert_if_watchlist(db, sighting)

    # Broadcast sighting event over WebSocket/Redis
    sighting_payload = {
        "id": str(sighting.id),
        "camera_id": str(camera_id),
        "camera_identifier": camera_identifier,
        "plate_text": sighting.plate_text,
        "plate_conf": sighting.plate_conf,
        "vehicle_class": sighting.vehicle_class,
        "timestamp": sighting.frame_ts.isoformat(),
        "bbox": [x, y, w, h],
        "crop_url": crop_rel_path,
        "plate_url": plate_rel_path,
        "is_alert": alert is not None
    }
    await publish_event("monitor_channel", "sighting", sighting_payload)

    return sighting
