from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.camera import CameraStatus, CameraSourceType


class CameraBase(BaseModel):
    camera_id: str = Field(..., example="GJ-AHM-SG-01")
    name: str = Field(..., example="SG Highway Junction 04")
    department: str = Field(default="Ahmedabad City Police")
    latitude: float = Field(..., example=23.030357)
    longitude: float = Field(..., example=72.517845)
    address: str = Field(..., example="Pakwan Cross Road, SG Highway, Ahmedabad")
    vendor: Optional[str] = Field(default="Hikvision")
    vms_type: Optional[str] = Field(default="Milestone")
    source_type: CameraSourceType = CameraSourceType.RTSP
    stream_url: str = Field(..., example="rtsp://192.168.1.100:554/live/ch0")
    status: CameraStatus = CameraStatus.ONLINE


class CameraCreate(CameraBase):
    pass


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    vendor: Optional[str] = None
    vms_type: Optional[str] = None
    source_type: Optional[CameraSourceType] = None
    stream_url: Optional[str] = None
    status: Optional[CameraStatus] = None


class CameraOut(CameraBase):
    id: int
    last_seen: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
