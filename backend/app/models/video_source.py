import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, BigInteger
from backend.app.core.database import Base


class VideoSourceType(str, enum.Enum):
    LOCAL_MP4 = "LOCAL_MP4"
    REMOTE_URL = "REMOTE_URL"
    RTSP = "RTSP"


class VideoSourceStatus(str, enum.Enum):
    STOPPED = "STOPPED"
    RUNNING = "RUNNING"
    ERROR = "ERROR"
    COMPLETED = "COMPLETED"


class VideoSource(Base):
    __tablename__ = "video_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    camera_id = Column(String(100), ForeignKey("cameras.camera_id"), nullable=False, index=True)
    source_type = Column(Enum(VideoSourceType), nullable=False, default=VideoSourceType.REMOTE_URL)
    url = Column(String(1000), nullable=False)
    
    status = Column(Enum(VideoSourceStatus), nullable=False, default=VideoSourceStatus.STOPPED)
    target_fps = Column(Float, nullable=False, default=5.0)
    frames_processed = Column(BigInteger, nullable=False, default=0)
    current_fps = Column(Float, nullable=True, default=0.0)
    last_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_started_at = Column(DateTime(timezone=True), nullable=True)
    last_stopped_at = Column(DateTime(timezone=True), nullable=True)
