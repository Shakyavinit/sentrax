import uuid
import json
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.redis import get_redis
from app.models.user import User
from app.schemas.alert import AlertResponse, AlertAcknowledgeRequest, AlertDismissRequest
from app.services import alert_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    status: Optional[str] = Query(None, description="active, acknowledged, dismissed"),
    priority: Optional[str] = Query(None),
    camera_id: Optional[uuid.UUID] = Query(None),
    plate: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    page: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offset = (page - 1) * limit
    return await alert_service.get_alerts(
        db=db,
        status=status,
        priority=priority,
        camera_id=camera_id,
        plate=plate,
        limit=limit,
        offset=offset
    )

@router.get("/stream")
async def alert_stream(request: Request):
    """Server-Sent Events stream for real-time alerts."""
    async def event_generator():
        redis = await get_redis()
        if not redis:
            # Degraded heartbeat loop if redis is unavailable
            while True:
                if await request.is_disconnected():
                    break
                yield {"event": "ping", "data": json.dumps({"status": "heartbeat"})}
                await asyncio.sleep(15)
            return

        pubsub = redis.pubsub()
        await pubsub.subscribe("alerts_channel")
        try:
            while True:
                if await request.is_disconnected():
                    break
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=2.0)
                if message and message["type"] == "message":
                    yield {
                        "event": "alert",
                        "data": message["data"]
                    }
                else:
                    # Keepalive ping
                    yield {"event": "ping", "data": "keepalive"}
                await asyncio.sleep(0.5)
        finally:
            await pubsub.unsubscribe("alerts_channel")

    return EventSourceResponse(event_generator())

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = await alert_service.get_alert_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert

@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: uuid.UUID,
    body: Optional[AlertAcknowledgeRequest] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = await alert_service.acknowledge_alert(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert

@router.patch("/{alert_id}/dismiss", response_model=AlertResponse)
async def dismiss_alert(
    alert_id: uuid.UUID,
    body: Optional[AlertDismissRequest] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = await alert_service.dismiss_alert(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert
