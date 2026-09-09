from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    action: str
    target_resource: Optional[str] = None
    target_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Any] = None


class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    badge_number: Optional[str] = None
    action: str
    target_resource: Optional[str] = None
    target_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Any] = None
    timestamp: datetime

    class Config:
        from_attributes = True
