import os
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import select, func

from app.tasks import celery_app
from app.tasks.common import record_task_state, run_async, sanitize_secrets, get_task_db
from app.models.camera import Camera
from app.models.sighting import Sighting
from app.models.alert import Alert
from app.core.logging import logger

WORKER_ID = "research_agent_ops"

async def _gather_telemetry_and_propose() -> Dict[str, Any]:
    async with get_task_db() as db:
        # 1. Total counts
        cam_count = (await db.execute(select(func.count(Camera.id)))).scalar() or 0
        online_cam_count = (await db.execute(select(func.count(Camera.id)).where(Camera.status == "online"))).scalar() or 0
        sighting_count = (await db.execute(select(func.count(Sighting.id)))).scalar() or 0
        alert_count = (await db.execute(select(func.count(Alert.id)))).scalar() or 0

        # Calculate uptime ratio
        uptime_ratio = round((online_cam_count / cam_count * 100) if cam_count > 0 else 0.0, 1)

        recommendation = {
            "id": f"REC-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
            "generated_at": datetime.utcnow().isoformat(),
            "source": "research_agent_ops_worker",
            "telemetry": {
                "total_cameras": cam_count,
                "online_cameras": online_cam_count,
                "network_uptime_pct": uptime_ratio,
                "total_sightings": sighting_count,
                "total_alerts": alert_count
            },
            "recommendation_text": (
                f"Surveillance network uptime is {uptime_ratio}%. "
                f"Camera cluster is operating normally. Recommendation: maintain current Active AI Camera limit."
                if uptime_ratio >= 70 else
                f"Camera availability dropped to {uptime_ratio}%. "
                f"Recommendation: schedule automatic ping health checks at higher frequency."
            ),
            "status": "pending_controller_review"
        }

        # Safe file write to agent_ops (strictly adhering to: never modify production code)
        agent_ops_dir = "/app/agent_ops" if os.path.exists("/app/agent_ops") else "agent_ops"
        recs_path = os.path.join(agent_ops_dir, "manager", "recommendations.json")
        
        try:
            current_recs = []
            if os.path.exists(recs_path):
                with open(recs_path, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        current_recs = json.loads(content)
            
            # Keep latest 20 recommendations
            current_recs.insert(0, recommendation)
            current_recs = current_recs[:20]

            os.makedirs(os.path.dirname(recs_path), exist_ok=True)
            with open(recs_path, "w", encoding="utf-8") as f:
                json.dump(current_recs, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not persist recommendation to {recs_path}: {e}")

        return recommendation

@celery_app.task(
    bind=True,
    name="app.tasks.research_worker.run_system_improvement_scout",
    max_retries=3,
    default_retry_delay=5
)
def run_system_improvement_scout(self):
    task_id = self.request.id or str(uuid.uuid4())
    record_task_state(task_id, WORKER_ID, "running")
    logger.info(f"[{WORKER_ID}] Running background research & improvement scout (governed by agent_ops)")

    try:
        results = run_async(_gather_telemetry_and_propose())
        record_task_state(task_id, WORKER_ID, "completed", results)
        logger.info(f"[{WORKER_ID}] Scout completed recommendation {results['id']} -> routed to Manager Digest")
        return results
    except Exception as exc:
        clean_err = sanitize_secrets(str(exc))
        logger.error(f"[{WORKER_ID}] Error in research scout: {clean_err}")
        if self.request.retries < self.max_retries:
            backoff = 2 ** self.request.retries * 5
            record_task_state(task_id, WORKER_ID, "queued", {"retry": self.request.retries + 1, "backoff": backoff}, error=clean_err)
            raise self.retry(exc=exc, countdown=backoff)
        else:
            record_task_state(task_id, WORKER_ID, "failed", {"retries_exhausted": True}, error=clean_err)
            raise exc
