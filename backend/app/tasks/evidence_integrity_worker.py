import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import select

from app.tasks import celery_app
from app.tasks.common import record_task_state, run_async, sanitize_secrets, get_task_db
from app.models.evidence import Evidence
from app.services.evidence_service import verify_evidence
from app.core.logging import logger

WORKER_ID = "evidence_integrity"

async def _verify_all_evidence_packages(limit: int = 50) -> Dict[str, Any]:
    async with get_task_db() as db:
        stmt = (
            select(Evidence)
            .order_by(Evidence.created_at.desc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        packages = res.scalars().all()

        verified_count = 0
        tampered_count = 0
        results = []

        for ev in packages:
            verify_resp = await verify_evidence(db, ev.id, user_id=None)
            if verify_resp:
                if verify_resp.valid:
                    verified_count += 1
                else:
                    tampered_count += 1

                results.append({
                    "evidence_id": str(ev.id),
                    "status": verify_resp.status,
                    "valid": verify_resp.valid,
                    "stored_hash": verify_resp.details.stored_frame_hash,
                    "computed_hash": verify_resp.details.computed_frame_hash
                })

        return {
            "total_packages_audited": len(packages),
            "verified_count": verified_count,
            "tampered_count": tampered_count,
            "sample_audits": results[:5]
        }

@celery_app.task(
    bind=True,
    name="app.tasks.evidence_integrity_worker.verify_evidence_integrity",
    max_retries=3,
    default_retry_delay=5
)
def verify_evidence_integrity(self, limit: int = 50):
    task_id = self.request.id or str(uuid.uuid4())
    record_task_state(task_id, WORKER_ID, "running", {"limit": limit})
    logger.info(f"[{WORKER_ID}] Starting Evidence Integrity Verification (computing actual SHA-256 byte hashes)")

    try:
        results = run_async(_verify_all_evidence_packages(limit))
        record_task_state(task_id, WORKER_ID, "completed", results)
        logger.info(f"[{WORKER_ID}] Completed: {results['verified_count']} verified, {results['tampered_count']} tampered")
        return results
    except Exception as exc:
        clean_err = sanitize_secrets(str(exc))
        logger.error(f"[{WORKER_ID}] Error in evidence integrity check: {clean_err}")
        if self.request.retries < self.max_retries:
            backoff = 2 ** self.request.retries * 5
            record_task_state(task_id, WORKER_ID, "queued", {"retry": self.request.retries + 1, "backoff": backoff}, error=clean_err)
            raise self.retry(exc=exc, countdown=backoff)
        else:
            record_task_state(task_id, WORKER_ID, "failed", {"retries_exhausted": True}, error=clean_err)
            raise exc
