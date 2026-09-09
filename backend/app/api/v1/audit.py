from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.audit import AuditLog
from backend.app.models.user import User, UserRole
from backend.app.schemas.audit import AuditLogOut
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.get("", response_model=List[AuditLogOut], dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.INVESTIGATOR))])
def list_audit_logs(
    action: Optional[str] = None,
    badge_number: Optional[str] = None,
    target_resource: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if badge_number:
        query = query.filter(AuditLog.badge_number == badge_number)
    if target_resource:
        query = query.filter(AuditLog.target_resource == target_resource)
    return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
