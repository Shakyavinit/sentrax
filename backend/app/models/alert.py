import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, Boolean
from backend.app.core.database import Base


class AlertSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class AlertStatus(str, enum.Enum):
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    DISPATCHED = "DISPATCHED"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    sighting_id = Column(Integer, ForeignKey("sightings.id"), nullable=False)
    watchlist_id = Column(Integer, ForeignKey("watchlist.id"), nullable=False)
    camera_id = Column(String(100), ForeignKey("cameras.camera_id"), nullable=False)
    
    plate_number = Column(String(50), index=True, nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False, default=AlertSeverity.HIGH)
    status = Column(Enum(AlertStatus), nullable=False, default=AlertStatus.NEW)
    
    notes = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=False, default=1.0)
    
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
