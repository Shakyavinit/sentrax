from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.watchlist import WatchlistCategory, WatchlistPriority


class WatchlistBase(BaseModel):
    plate_number: str = Field(..., example="GJ01AB1234")
    vehicle_make: Optional[str] = Field(None, example="Hyundai")
    vehicle_model: Optional[str] = Field(None, example="Creta")
    vehicle_color: Optional[str] = Field(None, example="White")
    owner_name: Optional[str] = Field(None, example="Unknown")
    fir_number: Optional[str] = Field(None, example="FIR/2026/0892")
    case_reference: Optional[str] = Field(None, example="CASE-HIT-AND-RUN-AHM")
    category: WatchlistCategory = WatchlistCategory.SUSPECT_VEHICLE
    priority: WatchlistPriority = WatchlistPriority.HIGH
    reason: str = Field(..., example="Suspect vehicle seen leaving incident area at 02:40 AM")
    is_active: bool = True


class WatchlistCreate(WatchlistBase):
    pass


class WatchlistOut(WatchlistBase):
    id: int
    created_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
