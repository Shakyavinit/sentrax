import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(String(32), unique=True, nullable=False, index=True)  # e.g. "CAM01"
    name = Column(String(128), nullable=False)
    location_name = Column(String(256), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rtsp_url = Column(Text, nullable=False)
    hls_url = Column(Text, nullable=True)
    protocol = Column(String(16), default="rtsp")  # rtsp, hls, webrtc
    codec = Column(String(16), default="h264")     # h264, h265
    resolution = Column(String(16), default="1920x1080")
    fps = Column(Integer, default=25)
    status = Column(String(16), default="unknown") # online, offline, warning, unknown
    last_seen = Column(DateTime(timezone=True), nullable=True)
    extra_metadata = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    sightings = relationship("Sighting", back_populates="camera", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="camera")
    evidence = relationship("Evidence", back_populates="camera")
