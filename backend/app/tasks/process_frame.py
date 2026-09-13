from app.tasks import celery_app
from app.core.logging import logger

@celery_app.task(name="app.tasks.process_frame.async_process_frame")
def async_process_frame(camera_id: str, frame_timestamp_iso: str):
    logger.info(f"Celery task: processing frame for camera {camera_id} at {frame_timestamp_iso}")
    return {"status": "processed", "camera_id": camera_id}
