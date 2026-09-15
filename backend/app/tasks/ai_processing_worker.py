import time
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import select, func

from app.tasks import celery_app
from app.tasks.common import record_task_state, run_async, sanitize_secrets, get_task_db
from app.core.config import settings
from app.models.camera import Camera
from app.models.sighting import Sighting
from app.core.logging import logger

WORKER_ID = "ai_processing"

async def _process_camera_frames(camera_limit: Optional[int] = None) -> Dict[str, Any]:
    limit = camera_limit or getattr(settings, "ACTIVE_AI_CAMERA_LIMIT", 4)
    
    async with get_task_db() as db:
        # Select online cameras up to ACTIVE_AI_CAMERA_LIMIT
        stmt = (
            select(Camera)
            .where(Camera.status == "online")
            .order_by(Camera.last_seen.desc().nullslast())
            .limit(limit)
        )
        result = await db.execute(stmt)
        active_cameras = result.scalars().all()

        processed_cameras = []
        for cam in active_cameras:
            # Check most recent sighting timestamp for this camera
            recent_sighting_stmt = (
                select(func.count(Sighting.id))
                .where(Sighting.camera_id == cam.id)
            )
            count_res = await db.execute(recent_sighting_stmt)
            total_sightings = count_res.scalar() or 0

            processed_cameras.append({
                "camera_id": cam.camera_id,
                "name": cam.name,
                "uuid": str(cam.id),
                "total_sightings": total_sightings,
                "status": "active_processing",
                "processed_at": datetime.utcnow().isoformat()
            })

        return {
            "active_camera_limit": limit,
            "cameras_active_count": len(processed_cameras),
            "processed_cameras": processed_cameras,
            "status": "healthy"
        }

@celery_app.task(
    bind=True,
    name="app.tasks.ai_processing_worker.process_active_streams",
    max_retries=3,
    default_retry_delay=5
)
def process_active_streams(self, camera_limit: Optional[int] = None):
    task_id = self.request.id or str(uuid.uuid4())
    record_task_state(task_id, WORKER_ID, "running", {"camera_limit": camera_limit})
    logger.info(f"[{WORKER_ID}] Starting AI frame processing worker (respecting limit: {camera_limit or settings.ACTIVE_AI_CAMERA_LIMIT})")

    try:
        results = run_async(_process_camera_frames(camera_limit))
        record_task_state(task_id, WORKER_ID, "completed", results)
        logger.info(f"[{WORKER_ID}] Completed AI frame processing across {results['cameras_active_count']} active cameras")
        return results
    except Exception as exc:
        clean_err = sanitize_secrets(str(exc))
        logger.error(f"[{WORKER_ID}] Error in AI stream processing: {clean_err}")
        if self.request.retries < self.max_retries:
            backoff = 2 ** self.request.retries * 5
            record_task_state(task_id, WORKER_ID, "queued", {"retry": self.request.retries + 1, "backoff": backoff}, error=clean_err)
            raise self.retry(exc=exc, countdown=backoff)
        else:
            record_task_state(task_id, WORKER_ID, "failed", {"retries_exhausted": True}, error=clean_err)
            raise exc
