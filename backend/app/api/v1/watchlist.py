import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.schemas.watchlist import WatchlistResponse, WatchlistCreate, WatchlistUpdate
from app.schemas.alert import AlertResponse
from app.services import watchlist_service, alert_service

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

@router.get("", response_model=List[WatchlistResponse])
async def list_watchlist(
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await watchlist_service.get_all_watchlist(db, active_only=active_only)

@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    data: WatchlistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator", "investigator"]))
):
    return await watchlist_service.create_watchlist_entry(db, data, current_user.id)

@router.patch("/{watchlist_id}", response_model=WatchlistResponse)
async def update_watchlist(
    watchlist_id: uuid.UUID,
    data: WatchlistUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator", "investigator"]))
):
    entry = await watchlist_service.update_watchlist_entry(db, watchlist_id, data)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist entry not found")
    return entry

@router.delete("/{watchlist_id}")
async def deactivate_watchlist(
    watchlist_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator"]))
):
    success = await watchlist_service.deactivate_watchlist_entry(db, watchlist_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist entry not found")
    return {"message": "Watchlist entry deactivated successfully"}

@router.get("/{watchlist_id}/alerts", response_model=List[AlertResponse])
async def get_watchlist_alerts(
    watchlist_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = await watchlist_service.get_watchlist_by_id(db, watchlist_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist entry not found")
    return await alert_service.get_alerts(db, plate=entry.plate_text)
