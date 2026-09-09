from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field
from backend.app.models.evidence import EvidenceType


class EvidenceCreate(BaseModel):
    file_path: str
    file_name: str
    file_size_bytes: int
    mime_type: str = "image/jpeg"
    sha256_hash: str
    md5_hash: Optional[str] = None
    evidence_type: EvidenceType = EvidenceType.IMAGE_FRAME
    camera_id: Optional[str] = None
    sighting_id: Optional[int] = None
    alert_id: Optional[int] = None
    case_reference: Optional[str] = None
    captured_at: datetime
    notes: Optional[str] = None


class EvidenceOut(BaseModel):
    id: int
    evidence_uuid: str
    file_name: str
    file_path: str
    file_size_bytes: int
    mime_type: str
    sha256_hash: str
    md5_hash: Optional[str] = None
    evidence_type: EvidenceType
    camera_id: Optional[str] = None
    sighting_id: Optional[int] = None
    alert_id: Optional[int] = None
    case_reference: Optional[str] = None
    captured_at: datetime
    created_at: datetime
    custody_chain: Optional[Any] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
