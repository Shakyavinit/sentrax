import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

class Correlation(Base):
    __tablename__ = "correlations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_text = Column(String(32), nullable=False, index=True)
    sighting_ids = Column(JSONB, nullable=False, default=list)  # list of sighting UUID strings
    camera_ids = Column(JSONB, nullable=False, default=list)    # list of camera UUID strings in order
    start_ts = Column(DateTime(timezone=True), nullable=False)
    end_ts = Column(DateTime(timezone=True), nullable=False)
    duration_mins = Column(Float, nullable=True)
    correlation_method = Column(String(32), default="plate_match") # plate_match, reid, combined
    confidence = Column(Float, nullable=True)
    path_wkt = Column(Text, nullable=True)                      # WKT linestring for map display
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

Index("idx_correlations_plate", Correlation.plate_text)
