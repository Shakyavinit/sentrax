from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field


class SightingCreate(BaseModel):
    camera_id: str
    plate_number: Optional[str] = None
    plate_confidence: Optional[float] = None
    vehicle_type: Optional[str] = None
    vehicle_color: Optional[str] = None
    vehicle_confidence: Optional[float] = None
    frame_number: Optional[int] = None
    vehicle_bbox: Optional[List[float]] = None
    plate_bbox: Optional[List[float]] = None
    snapshot_path: Optional[str] = None
    plate_crop_path: Optional[str] = None
    video_source: Optional[str] = None
    estimated_speed_kmh: Optional[float] = None
    direction_heading: Optional[str] = None
    timestamp: Optional[datetime] = None


class SightingOut(BaseModel):
    id: int
    camera_id: str
    timestamp: datetime
    plate_number: Optional[str] = None
    plate_confidence: Optional[float] = None
    vehicle_type: Optional[str] = None
    vehicle_color: Optional[str] = None
    vehicle_confidence: Optional[float] = None
    frame_number: Optional[int] = None
    vehicle_bbox: Optional[Any] = None
    plate_bbox: Optional[Any] = None
    snapshot_path: Optional[str] = None
    plate_crop_path: Optional[str] = None
    video_source: Optional[str] = None
    estimated_speed_kmh: Optional[float] = None
    direction_heading: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
