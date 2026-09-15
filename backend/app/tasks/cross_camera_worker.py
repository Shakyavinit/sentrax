import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy import select, and_, func

from app.tasks import celery_app
from app.tasks.common import record_task_state, run_async, sanitize_secrets, get_task_db
from app.models.sighting import Sighting
from app.models.correlation import Correlation
from app.services.correlation_service import correlate_vehicle
from app.core.logging import logger

WORKER_ID = "cross_camera_correlation"

async def _reconstruct_active_journeys(window_hours: int = 24, max_plates: int = 20) -> Dict[str, Any]:
    async with get_task_db() as db:
        since = datetime.utcnow() - timedelta(hours=window_hours)

        # Find plates with sightings across multiple cameras (>= 2 distinct camera IDs)
        plate_stmt = (
            select(Sighting.plate_text, func.count(func.distinct(Sighting.camera_id)).label("camera_count"))
            .where(and_(Sighting.plate_text.isnot(None), Sighting.frame_ts >= since))
            .group_by(Sighting.plate_text)
            .having(func.count(func.distinct(Sighting.camera_id)) >= 2)
            .limit(max_plates)
        )
        plate_res = await db.execute(plate_stmt)
        multi_cam_plates = plate_res.all()

        correlations_built = 0
        skipped_single_cam = 0
        details = []

        for row in multi_cam_plates:
            plate = row[0]
            distinct_cam_count = row[1]

            # Enforce rule: requires >= 2 distinct camera IDs
            if distinct_cam_count < 2:
                skipped_single_cam += 1
                continue

            corr = await correlate_vehicle(db, plate, window_hours=window_hours)
            if corr:
                correlations_built += 1
                details.append({
                    "plate_text": plate,
                    "cameras_count": distinct_cam_count,
                    "confidence": corr.confidence,
                    "start_time": corr.start_ts.isoformat() if corr.start_ts else None,
                    "end_time": corr.end_ts.isoformat() if corr.end_ts else None
                })

        return {
            "eligible_plates_evaluated": len(multi_cam_plates),
            "correlations_built": correlations_built,
            "skipped_insufficient_cameras": skipped_single_cam,
            "window_hours": window_hours,
            "journeys": details[:5]
        }

@celery_app.task(
    bind=True,
    name="app.tasks.cross_camera_worker.reconstruct_cross_camera_journeys",
    max_retries=3,
    default_retry_delay=5
)
def reconstruct_cross_camera_journeys(self, window_hours: int = 24, max_plates: int = 20):
    task_id = self.request.id or str(uuid.uuid4())
    record_task_state(task_id, WORKER_ID, "running", {
        "window_hours": window_hours,
        "max_plates": max_plates
    })
    logger.info(f"[{WORKER_ID}] Starting Cross-Camera Correlation Worker (strict >= 2 distinct cameras check)")

    try:
        results = run_async(_reconstruct_active_journeys(window_hours, max_plates))
        record_task_state(task_id, WORKER_ID, "completed", results)
        logger.info(f"[{WORKER_ID}] Completed: {results['correlations_built']} journeys built across >= 2 cameras")
        return results
    except Exception as exc:
        clean_err = sanitize_secrets(str(exc))
        logger.error(f"[{WORKER_ID}] Error in cross-camera correlation: {clean_err}")
        if self.request.retries < self.max_retries:
            backoff = 2 ** self.request.retries * 5
            record_task_state(task_id, WORKER_ID, "queued", {"retry": self.request.retries + 1, "backoff": backoff}, error=clean_err)
            raise self.retry(exc=exc, countdown=backoff)
        else:
            record_task_state(task_id, WORKER_ID, "failed", {"retries_exhausted": True}, error=clean_err)
            raise exc
