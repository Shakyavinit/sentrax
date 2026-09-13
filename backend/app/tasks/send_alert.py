from app.tasks import celery_app
from app.core.logging import logger

@celery_app.task(name="app.tasks.send_alert.async_dispatch_alert")
def async_dispatch_alert(alert_id: str, plate_text: str, priority: str):
    logger.info(f"Celery task: dispatched alert {alert_id} for plate {plate_text} ({priority})")
    return {"status": "dispatched", "alert_id": alert_id}
