import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_text = Column(String(32), unique=True, nullable=False, index=True)
    reason = Column(Text, nullable=False)
    priority = Column(String(16), default="medium")  # low, medium, high, critical
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    alerts = relationship("Alert", back_populates="watchlist")

Index("idx_watchlist_plate_active", Watchlist.plate_text, postgresql_where=Watchlist.active.is_(True))
