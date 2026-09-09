from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.video_source import VideoSourceType, VideoSourceStatus


class VideoSourceBase(BaseModel):
    name: str = Field(..., example="SG Highway Traffic Feed A")
    camera_id: str = Field(..., example="GJ-AHM-SG-01")
    source_type: VideoSourceType = Field(default=VideoSourceType.REMOTE_URL)
    url: str = Field(..., example="https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4")
    target_fps: float = Field(default=5.0, ge=1.0, le=30.0)


class VideoSourceCreate(VideoSourceBase):
    pass


class VideoSourceOut(VideoSourceBase):
    id: int
    status: VideoSourceStatus
    frames_processed: int
    current_fps: Optional[float] = 0.0
    last_error: Optional[str] = None
    created_at: datetime
    last_started_at: Optional[datetime] = None
    last_stopped_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VideoSourceStatusOut(BaseModel):
    id: int
    name: str
    camera_id: str
    status: VideoSourceStatus
    source_type: VideoSourceType
    target_fps: float
    current_fps: float
    frames_processed: int
    last_error: Optional[str] = None
    buffer_frames_cached: int = 0
    temp_storage_mb: float = 0.0
    evidence_storage_mb: float = 0.0
    is_streaming: bool = False
