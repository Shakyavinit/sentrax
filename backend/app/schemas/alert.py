import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AlertBase(BaseModel):
    watchlist_id: Optional[uuid.UUID] = None
    sighting_id: Optional[uuid.UUID] = None
    plate_text: str
    camera_id: Optional[uuid.UUID] = None
    priority: str = "medium"
    status: str = "active"

class AlertResponse(AlertBase):
    id: uuid.UUID
    triggered_at: datetime
    acknowledged_by: Optional[uuid.UUID] = None
    acknowledged_by_username: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    camera_name: Optional[str] = None
    camera_identifier: Optional[str] = None
    location_name: Optional[str] = None
    watchlist_reason: Optional[str] = None
    plate_conf: Optional[float] = None
    vehicle_class: Optional[str] = None
    frame_path: Optional[str] = None
    crop_path: Optional[str] = None
    plate_crop_path: Optional[str] = None

    class Config:
        from_attributes = True

class AlertAcknowledgeRequest(BaseModel):
    notes: Optional[str] = None

class AlertDismissRequest(BaseModel):
    notes: Optional[str] = None
