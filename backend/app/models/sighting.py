import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(UUID(as_uuid=True), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True, index=True)
    plate_text = Column(String(32), index=True, nullable=True)   # Cleaned plate string
    plate_raw = Column(String(64), nullable=True)                # Raw OCR output
    plate_conf = Column(Float, nullable=True)                    # ANPR confidence 0-1
    vehicle_class = Column(String(32), nullable=True)            # car, truck, bike, bus
    vehicle_conf = Column(Float, nullable=True)                  # Detection confidence
    track_id = Column(Integer, nullable=True)                    # DeepSORT track ID
    frame_ts = Column(DateTime(timezone=True), nullable=False, index=True)
    bbox_x = Column(Integer, nullable=True)
    bbox_y = Column(Integer, nullable=True)
    bbox_w = Column(Integer, nullable=True)
    bbox_h = Column(Integer, nullable=True)
    frame_path = Column(Text, nullable=True)
    crop_path = Column(Text, nullable=True)
    plate_crop_path = Column(Text, nullable=True)
    extra_metadata = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    camera = relationship("Camera", back_populates="sightings")
    alerts = relationship("Alert", back_populates="sighting")
    evidence = relationship("Evidence", back_populates="sighting")

Index("idx_sightings_plate_ts", Sighting.plate_text, Sighting.frame_ts.desc())
