import json
import re
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any, List
import redis
from app.core.config import settings
from app.core.logging import logger

WORKER_IDS = [
    "camera_health",
    "ai_processing",
    "anpr_consensus",
    "watchlist_correlation",
    "cross_camera_correlation",
    "evidence_integrity",
    "research_agent_ops"
]

WORKER_NAMES = {
    "camera_health": "Camera Health Worker",
    "ai_processing": "AI Processing Worker",
    "anpr_consensus": "Multi-Frame ANPR Consensus Worker",
    "watchlist_correlation": "Watchlist Correlation Worker",
    "cross_camera_correlation": "Cross-Camera Correlation Worker",
    "evidence_integrity": "Evidence Integrity Verification Worker",
    "research_agent_ops": "Research & Improvement Worker (agent_ops)"
}

def get_redis_client():
    return redis.from_url(settings.REDIS_URL, decode_responses=True)

def sanitize_secrets(text: Optional[str]) -> str:
    if not text:
        return ""
    # Mask passwords in URLs (rtsp://user:pass@host -> rtsp://user:***@host)
    sanitized = re.sub(r"://([^:]+):([^@]+)@", r"://\1:***@", str(text))
    # Mask common credential patterns
    sanitized = re.sub(
        r"(password|jwt_secret|api_key|token|auth_token|db_password)=[\"']?[^&\"'\s]+",
        r"\1=***",
        sanitized,
        flags=re.IGNORECASE
    )
    return sanitized

def run_async(coro):
    """Safely execute an async coroutine inside synchronous Celery worker."""
    return asyncio.run(coro)

def record_task_state(
    task_id: str,
    worker_id: str,
    status: str,
    details: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None
):
    """
    Records task lifecycle state (queued, running, completed, failed)
    and updates worker-level telemetry in Redis.
    """
    r = get_redis_client()
    now_iso = datetime.utcnow().isoformat()
    clean_error = sanitize_secrets(error) if error else None

    task_payload = {
        "task_id": task_id,
        "worker_id": worker_id,
        "status": status,
        "updated_at": now_iso,
        "details": details or {},
        "error": clean_error
    }

    # Store individual task record (1 day TTL)
    r.setex(f"sentrax:task:{task_id}", 86400, json.dumps(task_payload))

    # Update worker-level aggregate telemetry
    worker_key = f"sentrax:worker:{worker_id}:stats"
    pipe = r.pipeline()
    pipe.hset(worker_key, "worker_id", worker_id)
    pipe.hset(worker_key, "name", WORKER_NAMES.get(worker_id, worker_id))
    pipe.hset(worker_key, "last_run", now_iso)
    if clean_error:
        pipe.hset(worker_key, "last_error", clean_error)
    elif status == "completed":
        pipe.hdel(worker_key, "last_error")
    pipe.hincrby(worker_key, "total_runs", 1)

    if status == "completed":
        pipe.hincrby(worker_key, "success_count", 1)
    elif status == "failed":
        pipe.hincrby(worker_key, "failure_count", 1)

    pipe.execute()

def get_worker_telemetry(worker_id: str) -> Dict[str, Any]:
    """Retrieve telemetry metrics for a specific worker."""
    r = get_redis_client()
    raw = r.hgetall(f"sentrax:worker:{worker_id}:stats")
    if not raw:
        return {
            "id": worker_id,
            "name": WORKER_NAMES.get(worker_id, worker_id),
            "status": "idle",
            "last_run": None,
            "success_count": 0,
            "failure_count": 0,
            "last_error": None
        }
    return {
        "id": worker_id,
        "name": raw.get("name", WORKER_NAMES.get(worker_id, worker_id)),
        "status": raw.get("last_status", "idle"),
        "last_run": raw.get("last_run"),
        "success_count": int(raw.get("success_count", 0)),
        "failure_count": int(raw.get("failure_count", 0)),
        "last_error": raw.get("last_error") or None
    }


from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

_task_engine = None

def get_task_engine():
    global _task_engine
    if _task_engine is None:
        _task_engine = create_async_engine(
            settings.DATABASE_URL,
            poolclass=NullPool,
            future=True
        )
    return _task_engine

@asynccontextmanager
async def get_task_db():
    """Provides an isolated database session for Celery workers with NullPool."""
    engine = get_task_engine()
    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
