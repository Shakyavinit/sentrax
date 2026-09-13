import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.watchlist import Watchlist
from app.models.alert import Alert
from app.models.user import User
from app.schemas.watchlist import WatchlistCreate, WatchlistUpdate, WatchlistResponse

async def get_all_watchlist(db: AsyncSession, active_only: bool = False) -> List[WatchlistResponse]:
    query = select(Watchlist).options(selectinload(Watchlist.user))
    if active_only:
        query = query.where(Watchlist.active.is_(True))
    query = query.order_by(Watchlist.created_at.desc())
    result = await db.execute(query)
    entries = result.scalars().all()
    
    # Alert counts
    counts_res = await db.execute(
        select(Alert.watchlist_id, func.count(Alert.id)).group_by(Alert.watchlist_id)
    )
    alert_counts = dict(counts_res.all())
    
    responses = []
    for w in entries:
        resp = WatchlistResponse.model_validate(w)
        resp.added_by_username = w.user.username if w.user else "System"
        resp.alert_count = alert_counts.get(w.id, 0)
        responses.append(resp)
    return responses

async def get_watchlist_by_id(db: AsyncSession, watchlist_id: uuid.UUID) -> Optional[WatchlistResponse]:
    result = await db.execute(
        select(Watchlist).where(Watchlist.id == watchlist_id).options(selectinload(Watchlist.user))
    )
    w = result.scalar_one_or_none()
    if not w:
        return None
    resp = WatchlistResponse.model_validate(w)
    resp.added_by_username = w.user.username if w.user else "System"
    return resp

async def create_watchlist_entry(db: AsyncSession, data: WatchlistCreate, user_id: uuid.UUID) -> WatchlistResponse:
    clean_plate = data.plate_text.replace(" ", "").upper()
    existing = await db.execute(select(Watchlist).where(Watchlist.plate_text == clean_plate))
    if existing.scalar_one_or_none():
        # Update existing
        entry = existing.scalar_one()
        entry.active = True
        entry.reason = data.reason
        entry.priority = data.priority
        entry.expires_at = data.expires_at
        entry.notes = data.notes
        entry.updated_at = datetime.utcnow()
    else:
        entry = Watchlist(
            plate_text=clean_plate,
            reason=data.reason,
            priority=data.priority,
            added_by=user_id,
            active=True,
            expires_at=data.expires_at,
            notes=data.notes
        )
        db.add(entry)
        
    await db.commit()
    await db.refresh(entry)
    return WatchlistResponse.model_validate(entry)

async def update_watchlist_entry(
    db: AsyncSession, watchlist_id: uuid.UUID, data: WatchlistUpdate
) -> Optional[WatchlistResponse]:
    result = await db.execute(select(Watchlist).where(Watchlist.id == watchlist_id))
    entry = result.scalar_one_or_none()
    if not entry:
        return None
        
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(entry, k, v)
    entry.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(entry)
    return WatchlistResponse.model_validate(entry)

async def deactivate_watchlist_entry(db: AsyncSession, watchlist_id: uuid.UUID) -> bool:
    result = await db.execute(select(Watchlist).where(Watchlist.id == watchlist_id))
    entry = result.scalar_one_or_none()
    if not entry:
        return False
    entry.active = False
    entry.updated_at = datetime.utcnow()
    await db.commit()
    return True
