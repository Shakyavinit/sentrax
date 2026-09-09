from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.watchlist import Watchlist, WatchlistCategory, WatchlistPriority
from backend.app.models.user import User, UserRole
from backend.app.models.audit import AuditLog
from backend.app.schemas.watchlist import WatchlistCreate, WatchlistOut
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.get("", response_model=List[WatchlistOut])
def list_watchlist(
    category: Optional[WatchlistCategory] = None,
    priority: Optional[WatchlistPriority] = None,
    plate_number: Optional[str] = None,
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Watchlist)
    if active_only:
        query = query.filter(Watchlist.is_active == True)
    if category:
        query = query.filter(Watchlist.category == category)
    if priority:
        query = query.filter(Watchlist.priority == priority)
    if plate_number:
        query = query.filter(Watchlist.plate_number.ilike(f"%{plate_number.strip().upper()}%"))
    return query.order_by(Watchlist.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=WatchlistOut, dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.INVESTIGATOR))])
def add_vehicle_to_watchlist(
    vehicle_in: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_plate = vehicle_in.plate_number.strip().upper().replace(" ", "").replace("-", "")
    existing = db.query(Watchlist).filter(Watchlist.plate_number == clean_plate).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Vehicle with plate {clean_plate} is already in the watchlist")

    item = Watchlist(
        plate_number=clean_plate,
        vehicle_make=vehicle_in.vehicle_make,
        vehicle_model=vehicle_in.vehicle_model,
        vehicle_color=vehicle_in.vehicle_color,
        owner_name=vehicle_in.owner_name,
        fir_number=vehicle_in.fir_number,
        case_reference=vehicle_in.case_reference,
        category=vehicle_in.category,
        priority=vehicle_in.priority,
        reason=vehicle_in.reason,
        is_active=vehicle_in.is_active,
        created_by_user_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="ADD_WATCHLIST_TARGET",
        target_resource="watchlist",
        target_id=str(item.id),
        details={"plate_number": item.plate_number, "priority": item.priority.value, "category": item.category.value}
    )
    db.add(audit)
    db.commit()

    return item


@router.delete("/{watchlist_id}", dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPERVISOR))])
def remove_from_watchlist(
    watchlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    
    plate = item.plate_number
    db.delete(item)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="REMOVE_WATCHLIST_TARGET",
        target_resource="watchlist",
        target_id=str(watchlist_id),
        details={"plate_number": plate}
    )
    db.add(audit)
    db.commit()

    return {"status": "deleted", "id": watchlist_id, "plate_number": plate}
