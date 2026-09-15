import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy import select, and_

from app.tasks import celery_app
from app.tasks.common import record_task_state, run_async, sanitize_secrets, get_task_db
from app.models.watchlist import Watchlist
from app.models.sighting import Sighting
from app.models.alert import Alert
from app.core.redis import publish_event
from app.core.logging import logger

WORKER_ID = "watchlist_correlation"

async def _correlate_watchlist(debounce_minutes: int = 10, lookback_minutes: int = 30) -> Dict[str, Any]:
    async with get_task_db() as db:
        # 1. Fetch all active watchlist entries
        wl_stmt = select(Watchlist).where(Watchlist.active.is_(True))
        wl_res = await db.execute(wl_stmt)
        watchlist_entries = {w.plate_text.replace(" ", "").upper(): w for w in wl_res.scalars().all()}

        if not watchlist_entries:
            return {"active_watchlist_count": 0, "alerts_created": 0, "message": "No active watchlist entries"}

        # 2. Fetch recent sightings
        since = datetime.utcnow() - timedelta(minutes=lookback_minutes)
        s_stmt = (
            select(Sighting)
            .where(and_(Sighting.plate_text.isnot(None), Sighting.frame_ts >= since))
            .order_by(Sighting.frame_ts.desc())
            .limit(150)
        )
        s_res = await db.execute(s_stmt)
        sightings = s_res.scalars().all()

        alerts_created = 0
        duplicates_prevented = 0
        matches_found = 0

        debounce_threshold = datetime.utcnow() - timedelta(minutes=debounce_minutes)

        for s in sightings:
            clean_plate = s.plate_text.replace(" ", "").upper()
            if clean_plate in watchlist_entries:
                matches_found += 1
                wl_entry = watchlist_entries[clean_plate]

                # Check for existing alert for this sighting or (plate + camera within debounce window)
                existing_alert_stmt = (
                    select(Alert)
                    .where(
                        and_(
                            Alert.plate_text == clean_plate,
                            Alert.camera_id == s.camera_id,
                            Alert.triggered_at >= debounce_threshold
                        )
                    )
                )
                exist_res = await db.execute(existing_alert_stmt)
                existing_alert = exist_res.scalar_one_or_none()

                if existing_alert:
                    duplicates_prevented += 1
                    continue

                # Create new deduplicated alert
                new_alert = Alert(
                    watchlist_id=wl_entry.id,
                    sighting_id=s.id,
                    plate_text=clean_plate,
                    camera_id=s.camera_id,
                    triggered_at=datetime.utcnow(),
                    status="active",
                    priority=wl_entry.priority or "high"
                )
                db.add(new_alert)
                await db.commit()
                await db.refresh(new_alert)
                alerts_created += 1

                # Publish event to Redis
                try:
                    await publish_event("alerts_channel", "alert", {
                        "id": str(new_alert.id),
                        "plate_text": clean_plate,
                        "camera_id": str(s.camera_id) if s.camera_id else None,
                        "priority": new_alert.priority,
                        "triggered_at": new_alert.triggered_at.isoformat(),
                        "reason": wl_entry.reason
                    })
                except Exception as pub_err:
                    logger.warning(f"Failed to publish alert event: {pub_err}")

        return {
            "active_watchlist_count": len(watchlist_entries),
            "sightings_checked": len(sightings),
            "matches_found": matches_found,
            "alerts_created": alerts_created,
            "duplicates_prevented": duplicates_prevented
        }

@celery_app.task(
    bind=True,
    name="app.tasks.watchlist_correlation_worker.check_watchlist_correlations",
    max_retries=3,
    default_retry_delay=5
)
def check_watchlist_correlations(self, debounce_minutes: int = 10, lookback_minutes: int = 30):
    task_id = self.request.id or str(uuid.uuid4())
    record_task_state(task_id, WORKER_ID, "running", {
        "debounce_minutes": debounce_minutes,
        "lookback_minutes": lookback_minutes
    })
    logger.info(f"[{WORKER_ID}] Starting Watchlist Correlation Worker")

    try:
        results = run_async(_correlate_watchlist(debounce_minutes, lookback_minutes))
        record_task_state(task_id, WORKER_ID, "completed", results)
        logger.info(f"[{WORKER_ID}] Completed: {results['alerts_created']} alerts, {results['duplicates_prevented']} duplicates prevented")
        return results
    except Exception as exc:
        clean_err = sanitize_secrets(str(exc))
        logger.error(f"[{WORKER_ID}] Error in watchlist correlation: {clean_err}")
        if self.request.retries < self.max_retries:
            backoff = 2 ** self.request.retries * 5
            record_task_state(task_id, WORKER_ID, "queued", {"retry": self.request.retries + 1, "backoff": backoff}, error=clean_err)
            raise self.retry(exc=exc, countdown=backoff)
        else:
            record_task_state(task_id, WORKER_ID, "failed", {"retries_exhausted": True}, error=clean_err)
            raise exc
