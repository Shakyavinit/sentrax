import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.tasks import celery_app
from app.tasks.common import (
    WORKER_IDS,
    WORKER_NAMES,
    get_redis_client,
    get_worker_telemetry,
    sanitize_secrets
)
from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/system", tags=["system"])

class WorkerStatus(BaseModel):
    id: str
    name: str
    status: str
    last_run: Optional[str] = None
    success_count: int = 0
    failure_count: int = 0
    last_error: Optional[str] = None

class BackgroundSystemStatus(BaseModel):
    status: str
    timestamp: str
    redis_connected: bool
    celery_workers_online: int
    active_ai_camera_limit: int
    active_ai_cameras_count: int
    queues: Dict[str, int]
    workers: List[WorkerStatus]
    recent_tasks: List[Dict[str, Any]]

class TriggerWorkerRequest(BaseModel):
    worker_id: str
    params: Optional[Dict[str, Any]] = None

class TriggerWorkerResponse(BaseModel):
    dispatched: bool
    task_id: str
    worker_id: str
    message: str

@router.get("/background-status", response_model=BackgroundSystemStatus)
async def get_background_status():
    """
    Returns real-time health, queue depths, and execution telemetry
    for all 7 SENTRAX background operations workers.
    """
    r = get_redis_client()
    redis_ok = False
    try:
        redis_ok = bool(r.ping())
    except Exception as e:
        logger.error(f"Redis ping failed: {e}")

    # Inspect Celery workers
    celery_workers_count = 0
    try:
        insp = celery_app.control.inspect(timeout=1.5)
        active_nodes = insp.ping()
        if active_nodes:
            celery_workers_count = len(active_nodes)
    except Exception as e:
        logger.warning(f"Celery inspect error: {sanitize_secrets(str(e))}")

    # Queue lengths from Redis
    queue_names = ["celery", "frames", "evidence", "alerts"]
    queues = {}
    for q in queue_names:
        try:
            queues[q] = r.llen(q)
        except Exception:
            queues[q] = 0

    # Retrieve telemetry for each of the 7 workers
    workers = []
    has_failing_worker = False
    for wid in WORKER_IDS:
        telem = get_worker_telemetry(wid)
        if telem.get("status") == "failed":
            has_failing_worker = True
        workers.append(WorkerStatus(**telem))

    # Fetch recent tasks from Redis
    recent_tasks = []
    try:
        task_keys = r.keys("sentrax:task:*")
        # Take latest 10
        for k in sorted(task_keys, reverse=True)[:10]:
            raw_task = r.get(k)
            if raw_task:
                import json
                try:
                    recent_tasks.append(json.loads(raw_task))
                except Exception:
                    pass
    except Exception as e:
        logger.warning(f"Error fetching recent tasks: {e}")

    # Camera active count
    active_cameras_count = 10
    limit = getattr(settings, "ACTIVE_AI_CAMERA_LIMIT", 4)

    system_status = "operational"
    if not redis_ok:
        system_status = "offline"
    elif celery_workers_count == 0 or has_failing_worker:
        system_status = "degraded"

    return BackgroundSystemStatus(
        status=system_status,
        timestamp=datetime.utcnow().isoformat(),
        redis_connected=redis_ok,
        celery_workers_online=celery_workers_count,
        active_ai_camera_limit=limit,
        active_ai_cameras_count=min(active_cameras_count, limit),
        queues=queues,
        workers=workers,
        recent_tasks=recent_tasks
    )

@router.post("/trigger-worker", response_model=TriggerWorkerResponse)
async def trigger_worker(payload: TriggerWorkerRequest):
    """
    Manually triggers one of the 7 background workers via Celery.
    """
    wid = payload.worker_id
    params = payload.params or {}

    from app.tasks import (
        camera_health_worker,
        ai_processing_worker,
        anpr_consensus_worker,
        watchlist_correlation_worker,
        cross_camera_worker,
        evidence_integrity_worker,
        research_worker
    )

    task = None
    if wid == "camera_health":
        task = camera_health_worker.check_camera_health.delay(params.get("camera_id"))
    elif wid == "ai_processing":
        task = ai_processing_worker.process_active_streams.delay(params.get("limit"))
    elif wid == "anpr_consensus":
        task = anpr_consensus_worker.evaluate_plate_consensus.delay(params.get("lookback_minutes", 60))
    elif wid == "watchlist_correlation":
        task = watchlist_correlation_worker.check_watchlist_correlations.delay(
            params.get("debounce_minutes", 10),
            params.get("lookback_minutes", 30)
        )
    elif wid == "cross_camera_correlation":
        task = cross_camera_worker.reconstruct_cross_camera_journeys.delay(
            params.get("window_hours", 24),
            params.get("max_plates", 20)
        )
    elif wid == "evidence_integrity":
        task = evidence_integrity_worker.verify_evidence_integrity.delay(params.get("limit", 50))
    elif wid == "research_agent_ops":
        task = research_worker.run_system_improvement_scout.delay()
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown worker_id: '{wid}'. Must be one of: {WORKER_IDS}"
        )

    return TriggerWorkerResponse(
        dispatched=True,
        task_id=task.id,
        worker_id=wid,
        message=f"{WORKER_NAMES.get(wid, wid)} dispatched with task ID {task.id}"
    )
