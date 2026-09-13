import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class CameraBase(BaseModel):
    camera_id: str = Field(..., example="CAM01")
    name: str = Field(..., example="MG Road Junction, Ahmedabad")
    location_name: Optional[str] = Field(None, example="Ahmedabad")
    latitude: Optional[float] = Field(None, example=23.0258)
    longitude: Optional[float] = Field(None, example=72.5839)
    rtsp_url: str
    hls_url: Optional[str] = None
    protocol: Optional[str] = "rtsp"
    codec: Optional[str] = "h264"
    resolution: Optional[str] = "1920x1080"
    fps: Optional[int] = 25
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rtsp_url: Optional[str] = None
    hls_url: Optional[str] = None
    protocol: Optional[str] = None
    codec: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CameraResponse(CameraBase):
    id: uuid.UUID
    status: str
    last_seen: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    recent_sightings_count: Optional[int] = 0
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, validation_alias="extra_metadata")

    class Config:
        from_attributes = True
        populate_by_name = True

class CameraTestResponse(BaseModel):
    reachable: bool
    latency_ms: int
    status: str
    detail: Optional[str] = None
