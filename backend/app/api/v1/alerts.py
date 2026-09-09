from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.alert import Alert, AlertStatus, AlertSeverity
from backend.app.models.user import User, UserRole
from backend.app.models.audit import AuditLog
from backend.app.schemas.alert import AlertOut, AlertStatusUpdate
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.get("", response_model=List[AlertOut])
def list_alerts(
    status: Optional[AlertStatus] = None,
    severity: Optional[AlertSeverity] = None,
    camera_id: Optional[str] = None,
    plate_number: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    if camera_id:
        query = query.filter(Alert.camera_id == camera_id)
    if plate_number:
        query = query.filter(Alert.plate_number.ilike(f"%{plate_number.strip().upper()}%"))
    return query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_alert_status(
    alert_id: int,
    status_update: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = status_update.status
    if status_update.notes:
        alert.notes = (alert.notes or "") + f"\n[{datetime.now(timezone.utc).isoformat()}] {current_user.full_name}: {status_update.notes}"

    if status_update.status == AlertStatus.ACKNOWLEDGED:
        alert.acknowledged_at = datetime.now(timezone.utc)
        alert.assigned_to_user_id = current_user.id
    elif status_update.status in [AlertStatus.RESOLVED, AlertStatus.FALSE_POSITIVE]:
        alert.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(alert)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="UPDATE_ALERT_STATUS",
        target_resource="alerts",
        target_id=str(alert.id),
        details={"status": status_update.status.value, "plate": alert.plate_number}
    )
    db.add(audit)
    db.commit()

    return alert
