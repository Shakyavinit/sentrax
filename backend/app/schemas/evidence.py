import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class EvidenceBase(BaseModel):
    case_id: Optional[str] = None
    sighting_id: Optional[uuid.UUID] = None
    alert_id: Optional[uuid.UUID] = None
    plate_text: Optional[str] = None
    camera_id: Optional[uuid.UUID] = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: uuid.UUID
    frame_ts: Optional[datetime] = None
    frame_path: Optional[str] = None
    vehicle_crop_path: Optional[str] = None
    plate_crop_path: Optional[str] = None
    frame_hash: Optional[str] = None
    vehicle_hash: Optional[str] = None
    plate_hash: Optional[str] = None
    metadata_json: Optional[str] = None
    metadata_hash: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_model_version: Optional[str] = None
    exported: bool = False
    created_at: Optional[datetime] = None
    camera_name: Optional[str] = None
    camera_identifier: Optional[str] = None
    location_name: Optional[str] = None

    class Config:
        from_attributes = True

class EvidenceVerificationDetail(BaseModel):
    frame_valid: bool
    vehicle_crop_valid: bool
    plate_crop_valid: bool
    metadata_valid: bool
    stored_frame_hash: Optional[str] = None
    computed_frame_hash: Optional[str] = None
    stored_metadata_hash: Optional[str] = None
    computed_metadata_hash: Optional[str] = None

class EvidenceVerifyResponse(BaseModel):
    evidence_id: uuid.UUID
    valid: bool
    status: str # "Verified", "Tampered", "Missing Files"
    verified_at: datetime
    details: EvidenceVerificationDetail

class AuditLogItem(BaseModel):
    id: int
    user_id: Optional[uuid.UUID] = None
    username: Optional[str] = None
    action: str
    target_type: Optional[str] = None
    target_id: Optional[uuid.UUID] = None
    detail: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BulkExportRequest(BaseModel):
    evidence_ids: List[uuid.UUID]
    case_id: Optional[str] = "GENERAL_INVESTIGATION"
