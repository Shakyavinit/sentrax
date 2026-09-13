from app.tasks import celery_app
from app.core.logging import logger

@celery_app.task(name="app.tasks.generate_evidence.async_preserve_evidence")
def async_preserve_evidence(sighting_id: str, case_id: str = "AUTO"):
    logger.info(f"Celery task: preserving evidence for sighting {sighting_id}")
    return {"status": "preserved", "sighting_id": sighting_id}
