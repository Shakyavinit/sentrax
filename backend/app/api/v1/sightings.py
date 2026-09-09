from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.ws import ws_manager
from backend.app.models.sighting import Sighting
from backend.app.models.watchlist import Watchlist
from backend.app.models.alert import Alert, AlertSeverity, AlertStatus
from backend.app.models.user import User
from backend.app.schemas.sighting import SightingCreate, SightingOut
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[SightingOut])
def list_sightings(
    camera_id: Optional[str] = None,
    plate_number: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Sighting)
    if camera_id:
        query = query.filter(Sighting.camera_id == camera_id)
    if plate_number:
        query = query.filter(Sighting.plate_number.ilike(f"%{plate_number.strip().upper()}%"))
    if vehicle_type:
        query = query.filter(Sighting.vehicle_type == vehicle_type)
    if from_date:
        query = query.filter(Sighting.timestamp >= from_date)
    if to_date:
        query = query.filter(Sighting.timestamp <= to_date)
        
    return query.order_by(Sighting.timestamp.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=SightingOut)
async def record_sighting(
    sighting_in: SightingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Called by AI Pipeline / Video Ingest worker to record a genuine detection.
    Performs real-time automated watchlist matching and triggers WebSocket alerts.
    """
    clean_plate = sighting_in.plate_number.strip().upper().replace(" ", "").replace("-", "") if sighting_in.plate_number else None

    sighting = Sighting(
        camera_id=sighting_in.camera_id,
        timestamp=sighting_in.timestamp or datetime.now(timezone.utc),
        plate_number=clean_plate,
        plate_confidence=sighting_in.plate_confidence,
        vehicle_type=sighting_in.vehicle_type,
        vehicle_color=sighting_in.vehicle_color,
        vehicle_confidence=sighting_in.vehicle_confidence,
        frame_number=sighting_in.frame_number,
        vehicle_bbox=sighting_in.vehicle_bbox,
        plate_bbox=sighting_in.plate_bbox,
        snapshot_path=sighting_in.snapshot_path,
        plate_crop_path=sighting_in.plate_crop_path,
        video_source=sighting_in.video_source,
        estimated_speed_kmh=sighting_in.estimated_speed_kmh,
        direction_heading=sighting_in.direction_heading,
    )
    db.add(sighting)
    db.commit()
    db.refresh(sighting)

    # Watchlist cross-check
    if clean_plate:
        matched_target = db.query(Watchlist).filter(
            Watchlist.plate_number == clean_plate,
            Watchlist.is_active == True
        ).first()

        if matched_target:
            alert = Alert(
                sighting_id=sighting.id,
                watchlist_id=matched_target.id,
                camera_id=sighting.camera_id,
                plate_number=clean_plate,
                severity=AlertSeverity[matched_target.priority.value],
                status=AlertStatus.NEW,
                confidence_score=sighting.plate_confidence or 0.95,
                notes=f"Automatic intercept match: {matched_target.reason}"
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)

            # Broadcast live alert to all connected command center consoles
            await ws_manager.broadcast("ALERT_TRIGGERED", {
                "alert_id": alert.id,
                "plate_number": clean_plate,
                "camera_id": sighting.camera_id,
                "severity": alert.severity.value,
                "timestamp": str(alert.created_at),
                "reason": matched_target.reason,
                "vehicle": f"{matched_target.vehicle_make or ''} {matched_target.vehicle_model or ''}".strip(),
                "snapshot_url": sighting.snapshot_path
            })

    return sighting
