import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    watchlist_id = Column(UUID(as_uuid=True), ForeignKey("watchlist.id"), nullable=True)
    sighting_id = Column(UUID(as_uuid=True), ForeignKey("sightings.id"), nullable=True)
    plate_text = Column(String(32), nullable=False, index=True)
    camera_id = Column(UUID(as_uuid=True), ForeignKey("cameras.id"), nullable=True)
    triggered_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    status = Column(String(16), default="active", index=True)  # active, acknowledged, dismissed
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    priority = Column(String(16), default="medium")

    watchlist = relationship("Watchlist", back_populates="alerts")
    sighting = relationship("Sighting", back_populates="alerts")
    camera = relationship("Camera", back_populates="alerts")
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    evidence = relationship("Evidence", back_populates="alert")

Index("idx_alerts_status_time", Alert.status, Alert.triggered_at.desc())
