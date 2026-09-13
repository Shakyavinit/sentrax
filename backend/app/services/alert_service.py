import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.alert import Alert
from app.models.watchlist import Watchlist
from app.models.sighting import Sighting
from app.models.camera import Camera
from app.models.user import User
from app.schemas.alert import AlertResponse
from app.core.redis import publish_event
from app.core.logging import logger

async def get_alerts(
    db: AsyncSession,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    camera_id: Optional[uuid.UUID] = None,
    plate: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[AlertResponse]:
    query = select(Alert).options(
        selectinload(Alert.watchlist),
        selectinload(Alert.sighting),
        selectinload(Alert.camera),
        selectinload(Alert.acknowledger)
    )
    filters = []
    if status:
        filters.append(Alert.status == status)
    if priority:
        filters.append(Alert.priority == priority)
    if camera_id:
        filters.append(Alert.camera_id == camera_id)
    if plate:
        clean_plate = plate.replace(" ", "").upper()
        filters.append(Alert.plate_text.ilike(f"%{clean_plate}%"))
        
    if filters:
        query = query.where(and_(*filters))
        
    query = query.order_by(Alert.triggered_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    responses = []
    for a in alerts:
        resp = AlertResponse.model_validate(a)
        if a.camera:
            resp.camera_name = a.camera.name
            resp.camera_identifier = a.camera.camera_id
            resp.location_name = a.camera.location_name
        if a.watchlist:
            resp.watchlist_reason = a.watchlist.reason
        if a.sighting:
            resp.plate_conf = a.sighting.plate_conf
            resp.vehicle_class = a.sighting.vehicle_class
            resp.frame_path = a.sighting.frame_path
            resp.crop_path = a.sighting.crop_path
            resp.plate_crop_path = a.sighting.plate_crop_path
        if a.acknowledger:
            resp.acknowledged_by_username = a.acknowledger.username
        responses.append(resp)
    return responses

async def get_alert_by_id(db: AsyncSession, alert_id: uuid.UUID) -> Optional[AlertResponse]:
    query = select(Alert).where(Alert.id == alert_id).options(
        selectinload(Alert.watchlist),
        selectinload(Alert.sighting),
        selectinload(Alert.camera),
        selectinload(Alert.acknowledger)
    )
    result = await db.execute(query)
    a = result.scalar_one_or_none()
    if not a:
        return None
        
    resp = AlertResponse.model_validate(a)
    if a.camera:
        resp.camera_name = a.camera.name
        resp.camera_identifier = a.camera.camera_id
        resp.location_name = a.camera.location_name
    if a.watchlist:
        resp.watchlist_reason = a.watchlist.reason
    if a.sighting:
        resp.plate_conf = a.sighting.plate_conf
        resp.vehicle_class = a.sighting.vehicle_class
        resp.frame_path = a.sighting.frame_path
        resp.crop_path = a.sighting.crop_path
        resp.plate_crop_path = a.sighting.plate_crop_path
    if a.acknowledger:
        resp.acknowledged_by_username = a.acknowledger.username
    return resp

async def acknowledge_alert(db: AsyncSession, alert_id: uuid.UUID, user_id: uuid.UUID) -> Optional[AlertResponse]:
    query = select(Alert).where(Alert.id == alert_id).options(
        selectinload(Alert.watchlist),
        selectinload(Alert.sighting),
        selectinload(Alert.camera)
    )
    result = await db.execute(query)
    a = result.scalar_one_or_none()
    if not a:
        return None
        
    a.status = "acknowledged"
    a.acknowledged_by = user_id
    a.acknowledged_at = datetime.utcnow()
    await db.commit()
    await db.refresh(a)
    return await get_alert_by_id(db, alert_id)

async def dismiss_alert(db: AsyncSession, alert_id: uuid.UUID, user_id: uuid.UUID) -> Optional[AlertResponse]:
    query = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(query)
    a = result.scalar_one_or_none()
    if not a:
        return None
        
    a.status = "dismissed"
    a.acknowledged_by = user_id
    a.acknowledged_at = datetime.utcnow()
    await db.commit()
    return await get_alert_by_id(db, alert_id)

async def trigger_alert_if_watchlist(db: AsyncSession, sighting: Sighting) -> Optional[Alert]:
    if not sighting.plate_text:
        return None
        
    clean_plate = sighting.plate_text.replace(" ", "").upper()
    res = await db.execute(
        select(Watchlist).where(Watchlist.plate_text == clean_plate, Watchlist.active.is_(True))
    )
    watchlist_entry = res.scalar_one_or_none()
    if not watchlist_entry:
        return None
        
    alert = Alert(
        watchlist_id=watchlist_entry.id,
        sighting_id=sighting.id,
        plate_text=clean_plate,
        camera_id=sighting.camera_id,
        triggered_at=datetime.utcnow(),
        status="active",
        priority=watchlist_entry.priority or "medium"
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    # Broadcast alert
    payload = {
        "id": str(alert.id),
        "plate_text": alert.plate_text,
        "camera_id": str(alert.camera_id) if alert.camera_id else None,
        "priority": alert.priority,
        "triggered_at": alert.triggered_at.isoformat(),
        "reason": watchlist_entry.reason
    }
    await publish_event("alerts_channel", "alert", payload)
    return alert
