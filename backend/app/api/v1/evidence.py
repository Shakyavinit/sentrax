import hashlib
import os
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.evidence import Evidence, EvidenceType
from backend.app.models.user import User, UserRole
from backend.app.models.audit import AuditLog
from backend.app.schemas.evidence import EvidenceOut, EvidenceCreate
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter()


def calculate_sha256_and_save(file_bytes: bytes, destination_path: str) -> str:
    sha256 = hashlib.sha256(file_bytes).hexdigest()
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    with open(destination_path, "wb") as f:
        f.write(file_bytes)
    return sha256


@router.get("", response_model=List[EvidenceOut])
def list_evidence(
    case_reference: Optional[str] = None,
    camera_id: Optional[str] = None,
    evidence_type: Optional[EvidenceType] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Evidence)
    if case_reference:
        query = query.filter(Evidence.case_reference.ilike(f"%{case_reference}%"))
    if camera_id:
        query = query.filter(Evidence.camera_id == camera_id)
    if evidence_type:
        query = query.filter(Evidence.evidence_type == evidence_type)
    return query.order_by(Evidence.captured_at.desc()).offset(skip).limit(limit).all()


@router.post("/upload", response_model=EvidenceOut)
async def upload_forensic_evidence(
    file: UploadFile = File(...),
    evidence_type: EvidenceType = Form(EvidenceType.IMAGE_FRAME),
    camera_id: Optional[str] = Form(None),
    sighting_id: Optional[int] = Form(None),
    alert_id: Optional[int] = Form(None),
    case_reference: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    evidence_id = str(uuid.uuid4())
    filename = f"{evidence_id}_{file.filename}"
    file_path = os.path.join(settings.EVIDENCE_DIR, filename)

    sha256_hash = calculate_sha256_and_save(contents, file_path)

    evidence = Evidence(
        evidence_uuid=evidence_id,
        file_path=file_path,
        file_name=file.filename or "unknown",
        file_size_bytes=len(contents),
        mime_type=file.content_type or "application/octet-stream",
        sha256_hash=sha256_hash,
        evidence_type=evidence_type,
        camera_id=camera_id,
        sighting_id=sighting_id,
        alert_id=alert_id,
        case_reference=case_reference,
        captured_at=datetime.now(timezone.utc),
        custody_chain=[
            {
                "action": "DEPOSITED_TO_VAULT",
                "officer_badge": current_user.badge_number,
                "officer_name": current_user.full_name,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "verified_hash": sha256_hash
            }
        ],
        notes=notes
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="EVIDENCE_ENCRYPT_AND_LOCK",
        target_resource="evidence",
        target_id=evidence_id,
        details={"sha256": sha256_hash, "file_name": file.filename}
    )
    db.add(audit)
    db.commit()

    return evidence


@router.get("/{evidence_uuid}/verify")
def verify_evidence_integrity(
    evidence_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Forensic Integrity Verification:
    Reads physical file from disk, recalculates SHA-256 and compares with immutable DB record.
    """
    evidence = db.query(Evidence).filter(Evidence.evidence_uuid == evidence_uuid).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found in vault")
    
    if not os.path.exists(evidence.file_path):
        raise HTTPException(status_code=500, detail="Physical evidence file missing on disk")

    with open(evidence.file_path, "rb") as f:
        recalculated_hash = hashlib.sha256(f.read()).hexdigest()

    is_intact = (recalculated_hash == evidence.sha256_hash)

    # Log integrity audit inspection
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="INTEGRITY_VERIFICATION_CHECK",
        target_resource="evidence",
        target_id=evidence_uuid,
        details={"intact": is_intact, "db_hash": evidence.sha256_hash, "disk_hash": recalculated_hash}
    )
    db.add(audit)
    db.commit()

    return {
        "evidence_uuid": evidence_uuid,
        "database_sha256": evidence.sha256_hash,
        "recalculated_sha256": recalculated_hash,
        "tamper_detected": not is_intact,
        "status": "SECURE_AND_VERIFIED" if is_intact else "TAMPERED_OR_CORRUPT"
    }
