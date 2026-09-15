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
    task_default_queue="celery",
    task_routes={
        "app.tasks.process_frame.*": {"queue": "celery"},
        "app.tasks.generate_evidence.*": {"queue": "celery"},
        "app.tasks.send_alert.*": {"queue": "celery"},
        "app.tasks.camera_health_worker.*": {"queue": "celery"},
        "app.tasks.ai_processing_worker.*": {"queue": "celery"},
        "app.tasks.anpr_consensus_worker.*": {"queue": "celery"},
        "app.tasks.watchlist_correlation_worker.*": {"queue": "celery"},
        "app.tasks.cross_camera_worker.*": {"queue": "celery"},
        "app.tasks.evidence_integrity_worker.*": {"queue": "celery"},
        "app.tasks.research_worker.*": {"queue": "celery"},
    }
)

# Explicitly import all tasks for worker auto-discovery
from app.tasks import (
    process_frame,
    generate_evidence,
    send_alert,
    camera_health_worker,
    ai_processing_worker,
    anpr_consensus_worker,
    watchlist_correlation_worker,
    cross_camera_worker,
    evidence_integrity_worker,
    research_worker,
)
