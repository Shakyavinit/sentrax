from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(100), ForeignKey("cameras.camera_id"), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    
    # Plate info
    plate_number = Column(String(50), index=True, nullable=True)
    plate_confidence = Column(Float, nullable=True) # 0.0 - 1.0
    
    # Vehicle info
    vehicle_type = Column(String(50), nullable=True) # car, truck, bus, motorcycle, auto_rickshaw
    vehicle_color = Column(String(50), nullable=True)
    vehicle_confidence = Column(Float, nullable=True)

    # Frame details & Bounding boxes
    frame_number = Column(Integer, nullable=True)
    vehicle_bbox = Column(JSON, nullable=True) # [x1, y1, x2, y2]
    plate_bbox = Column(JSON, nullable=True)   # [x1, y1, x2, y2]

    # Stored media file paths
    snapshot_path = Column(String(500), nullable=True)
    plate_crop_path = Column(String(500), nullable=True)
    video_source = Column(String(500), nullable=True)

    # Direction and speed telemetry if computed
    estimated_speed_kmh = Column(Float, nullable=True)
    direction_heading = Column(String(20), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
