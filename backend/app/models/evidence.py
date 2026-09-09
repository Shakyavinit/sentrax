import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Enum, Text, ForeignKey, JSON
from backend.app.core.database import Base


class EvidenceType(str, enum.Enum):
    IMAGE_FRAME = "IMAGE_FRAME"
    PLATE_CROP = "PLATE_CROP"
    VIDEO_CLIP = "VIDEO_CLIP"
    SYSTEM_LOG = "SYSTEM_LOG"
    TELEMETRY_EXPORT = "TELEMETRY_EXPORT"


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    evidence_uuid = Column(String(64), unique=True, index=True, nullable=False)
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False, default="image/jpeg")
    
    # Forensic Cryptographic Integrity
    sha256_hash = Column(String(64), index=True, nullable=False)
    md5_hash = Column(String(32), nullable=True)

    evidence_type = Column(Enum(EvidenceType), nullable=False, default=EvidenceType.IMAGE_FRAME)
    camera_id = Column(String(100), ForeignKey("cameras.camera_id"), nullable=True)
    sighting_id = Column(Integer, ForeignKey("sightings.id"), nullable=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    case_reference = Column(String(100), nullable=True)
    
    captured_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Chain of custody
    custody_chain = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
