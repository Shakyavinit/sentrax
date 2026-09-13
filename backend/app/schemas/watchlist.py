import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class WatchlistBase(BaseModel):
    plate_text: str = Field(..., example="GJ01AB1234")
    reason: str = Field(..., example="Suspected vehicle in financial fraud investigation")
    priority: str = Field(default="medium", example="high") # low, medium, high, critical
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistUpdate(BaseModel):
    reason: Optional[str] = None
    priority: Optional[str] = None
    active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None

class WatchlistResponse(WatchlistBase):
    id: uuid.UUID
    added_by: Optional[uuid.UUID] = None
    added_by_username: Optional[str] = None
    active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    alert_count: Optional[int] = 0

    class Config:
        from_attributes = True
