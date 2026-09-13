import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(String(64), nullable=True, index=True) # Optional investigator case ref
    sighting_id = Column(UUID(as_uuid=True), ForeignKey("sightings.id"), nullable=True)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"), nullable=True)
    plate_text = Column(String(32), nullable=True, index=True)
    camera_id = Column(UUID(as_uuid=True), ForeignKey("cameras.id"), nullable=True)
    frame_ts = Column(DateTime(timezone=True), nullable=True)
    frame_path = Column(Text, nullable=True)
    vehicle_crop_path = Column(Text, nullable=True)
    plate_crop_path = Column(Text, nullable=True)
    frame_hash = Column(String(64), nullable=True)       # SHA-256 hex
    vehicle_hash = Column(String(64), nullable=True)     # SHA-256 hex
    plate_hash = Column(String(64), nullable=True)       # SHA-256 hex
    metadata_json = Column(Text, nullable=True)          # Full metadata as JSON string
    metadata_hash = Column(String(64), nullable=True)    # SHA-256 of metadata JSON
    ai_confidence = Column(Float, nullable=True)
    ai_model_version = Column(String(32), default="YOLOv8+PaddleOCR")
    exported = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    sighting = relationship("Sighting", back_populates="evidence")
    alert = relationship("Alert", back_populates="evidence")
    camera = relationship("Camera", back_populates="evidence")

Index("idx_evidence_plate", Evidence.plate_text)
Index("idx_evidence_case", Evidence.case_id)
