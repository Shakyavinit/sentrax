from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.alert import AlertSeverity, AlertStatus
from backend.app.schemas.watchlist import WatchlistOut
from backend.app.schemas.sighting import SightingOut


class AlertCreate(BaseModel):
    sighting_id: int
    watchlist_id: int
    camera_id: str
    plate_number: str
    severity: AlertSeverity = AlertSeverity.HIGH
    confidence_score: float = 1.0
    notes: Optional[str] = None


class AlertStatusUpdate(BaseModel):
    status: AlertStatus
    notes: Optional[str] = None


class AlertOut(BaseModel):
    id: int
    sighting_id: int
    watchlist_id: int
    camera_id: str
    plate_number: str
    severity: AlertSeverity
    status: AlertStatus
    confidence_score: float
    notes: Optional[str] = None
    assigned_to_user_id: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
