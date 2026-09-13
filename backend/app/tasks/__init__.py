from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "sentrax_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.tasks.process_frame.*": {"queue": "frames"},
        "app.tasks.generate_evidence.*": {"queue": "evidence"},
        "app.tasks.send_alert.*": {"queue": "alerts"},
    }
)
