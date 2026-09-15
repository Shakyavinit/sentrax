import uuid
from collections import Counter
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy import select, and_, update

from app.tasks import celery_app
from app.tasks.common import record_task_state, run_async, sanitize_secrets, get_task_db
from app.models.sighting import Sighting
from app.core.logging import logger

WORKER_ID = "anpr_consensus"

def compute_character_consensus(plate_candidates: List[str]) -> str:
    """
    Performs multi-frame positional voting across OCR string candidates.
    """
    if not plate_candidates:
        return ""
    if len(plate_candidates) == 1:
        return plate_candidates[0]

    max_len = max(len(p) for p in plate_candidates)
    consensus_chars = []
    for idx in range(max_len):
        col_chars = [p[idx] for p in plate_candidates if idx < len(p)]
        most_common_char = Counter(col_chars).most_common(1)[0][0]
        consensus_chars.append(most_common_char)
    return "".join(consensus_chars)

async def _run_anpr_consensus(lookback_minutes: int = 60) -> Dict[str, Any]:
    async with get_task_db() as db:
        since = datetime.utcnow() - timedelta(minutes=lookback_minutes)
        # Fetch sightings with plate text from recent window
        stmt = (
            select(Sighting)
            .where(and_(Sighting.plate_text.isnot(None), Sighting.frame_ts >= since))
            .order_by(Sighting.frame_ts.desc())
            .limit(100)
        )
        result = await db.execute(stmt)
        sightings = result.scalars().all()

        confirmed_count = 0
        low_confidence_count = 0
        evaluated = []

        for s in sightings:
            plate = (s.plate_text or "").replace(" ", "").upper()
            conf = s.plate_conf or 0.0
            
            # Evaluate confidence tier
            if conf >= 0.85:
                status = "CONFIRMED"
                confirmed_count += 1
            elif conf >= 0.60:
                status = "LOW_CONFIDENCE"
                low_confidence_count += 1
            else:
                status = "AMBIGUOUS"
                low_confidence_count += 1

            evaluated.append({
                "sighting_id": str(s.id),
                "plate": plate,
                "confidence": round(conf, 2),
                "consensus_status": status
            })

        return {
            "window_minutes": lookback_minutes,
            "total_evaluated": len(evaluated),
            "confirmed_count": confirmed_count,
            "low_confidence_count": low_confidence_count,
            "sample_evaluations": evaluated[:10]
        }

@celery_app.task(
    bind=True,
    name="app.tasks.anpr_consensus_worker.evaluate_plate_consensus",
    max_retries=3,
    default_retry_delay=5
)
def evaluate_plate_consensus(self, lookback_minutes: int = 60):
    task_id = self.request.id or str(uuid.uuid4())
    record_task_state(task_id, WORKER_ID, "running", {"lookback_minutes": lookback_minutes})
    logger.info(f"[{WORKER_ID}] Starting Multi-Frame ANPR Consensus evaluation")

    try:
        results = run_async(_run_anpr_consensus(lookback_minutes))
        record_task_state(task_id, WORKER_ID, "completed", results)
        logger.info(f"[{WORKER_ID}] Completed ANPR Consensus: {results['total_evaluated']} records evaluated")
        return results
    except Exception as exc:
        clean_err = sanitize_secrets(str(exc))
        logger.error(f"[{WORKER_ID}] Error evaluating ANPR consensus: {clean_err}")
        if self.request.retries < self.max_retries:
            backoff = 2 ** self.request.retries * 5
            record_task_state(task_id, WORKER_ID, "queued", {"retry": self.request.retries + 1, "backoff": backoff}, error=clean_err)
            raise self.retry(exc=exc, countdown=backoff)
        else:
            record_task_state(task_id, WORKER_ID, "failed", {"retries_exhausted": True}, error=clean_err)
            raise exc
