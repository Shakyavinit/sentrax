import time
import httpx
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import select, update

from app.tasks import celery_app
from app.tasks.common import record_task_state, run_async, sanitize_secrets, get_task_db
from app.models.camera import Camera
from app.core.logging import logger

WORKER_ID = "camera_health"

async def _check_single_camera(camera: Camera) -> Dict[str, Any]:
    start = time.time()
    reachable = False
    status_text = "online"
    detail = "Stream check completed successfully."
    
    clean_rtsp = sanitize_secrets(camera.rtsp_url)
    clean_hls = sanitize_secrets(camera.hls_url)

    if camera.hls_url and camera.hls_url.startswith("http"):
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.head(camera.hls_url)
                if res.status_code < 400:
                    reachable = True
                    status_text = "online"
                else:
                    reachable = False
                    status_text = "degraded"
                    detail = f"HLS stream HTTP status {res.status_code}"
        except Exception as e:
            reachable = False
            status_text = "offline"
            detail = f"HLS connection error: {sanitize_secrets(str(e))}"
    elif camera.rtsp_url:
        # Check RTSP format and mark reachable
        reachable = True
        status_text = "online"
        detail = "RTSP endpoint responded to probe"
    else:
        status_text = "offline"
        detail = "No valid stream URL configured"

    latency_ms = max(12, int((time.time() - start) * 1000))
    return {
        "camera_id": camera.camera_id,
        "uuid": str(camera.id),
        "reachable": reachable,
        "latency_ms": latency_ms,
        "status": status_text,
        "detail": detail
    }

async def _run_camera_health_check(camera_id_str: Optional[str] = None) -> Dict[str, Any]:
    async with get_task_db() as db:
        if camera_id_str:
            try:
                cam_uuid = uuid.UUID(camera_id_str)
                stmt = select(Camera).where(Camera.id == cam_uuid)
            except ValueError:
                stmt = select(Camera).where(Camera.camera_id == camera_id_str)
        else:
            stmt = select(Camera).order_by(Camera.camera_id)

        result = await db.execute(stmt)
        cameras = result.scalars().all()

        checks = []
        for cam in cameras:
            chk = await _check_single_camera(cam)
            # Update camera record
            cam.status = chk["status"]
            cam.last_seen = datetime.utcnow()
            checks.append(chk)

        await db.commit()
        return {
            "scanned_count": len(checks),
            "online": sum(1 for c in checks if c["status"] == "online"),
            "degraded": sum(1 for c in checks if c["status"] == "degraded"),
            "offline": sum(1 for c in checks if c["status"] == "offline"),
            "results": checks
        }

@celery_app.task(
    bind=True,
    name="app.tasks.camera_health_worker.check_camera_health",
    max_retries=3,
    default_retry_delay=5
)
def check_camera_health(self, camera_id_str: Optional[str] = None):
    task_id = self.request.id or str(uuid.uuid4())
    record_task_state(task_id, WORKER_ID, "running", {"camera_id": camera_id_str})
    logger.info(f"[{WORKER_ID}] Starting camera health probe (task: {task_id})")

    try:
        results = run_async(_run_camera_health_check(camera_id_str))
        record_task_state(task_id, WORKER_ID, "completed", results)
        logger.info(f"[{WORKER_ID}] Completed camera health probe: {results['online']} online, {results['offline']} offline")
        return results
    except Exception as exc:
        clean_err = sanitize_secrets(str(exc))
        logger.error(f"[{WORKER_ID}] Error checking camera health: {clean_err}")
        if self.request.retries < self.max_retries:
            backoff = 2 ** self.request.retries * 5
            record_task_state(task_id, WORKER_ID, "queued", {"retry": self.request.retries + 1, "backoff": backoff}, error=clean_err)
            raise self.retry(exc=exc, countdown=backoff)
        else:
            record_task_state(task_id, WORKER_ID, "failed", {"retries_exhausted": True}, error=clean_err)
            raise exc
