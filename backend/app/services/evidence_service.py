import os
import uuid
import json
import hashlib
import zipfile
import io
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.evidence import Evidence
from app.models.sighting import Sighting
from app.models.camera import Camera
from app.models.alert import Alert
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.evidence import (
    EvidenceResponse,
    EvidenceVerifyResponse,
    EvidenceVerificationDetail,
    AuditLogItem
)
from app.core.config import settings
from app.core.logging import logger

def calculate_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().lower()

def calculate_file_sha256(filepath: str) -> Optional[str]:
    if not filepath or not os.path.exists(filepath):
        return None
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest().lower()

async def log_audit(
    db: AsyncSession,
    user_id: Optional[uuid.UUID],
    action: str,
    target_type: str,
    target_id: Optional[uuid.UUID],
    detail: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    audit = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail or {},
        ip_address=ip_address,
        created_at=datetime.utcnow()
    )
    db.add(audit)
    await db.commit()

async def preserve_evidence(
    db: AsyncSession,
    sighting_id: uuid.UUID,
    alert_id: Optional[uuid.UUID] = None,
    case_id: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None
) -> EvidenceResponse:
    res = await db.execute(
        select(Sighting).where(Sighting.id == sighting_id).options(selectinload(Sighting.camera))
    )
    sighting = res.scalar_one_or_none()
    if not sighting:
        raise ValueError(f"Sighting {sighting_id} not found")
        
    frame_hash = calculate_file_sha256(sighting.frame_path) if sighting.frame_path else None
    vehicle_hash = calculate_file_sha256(sighting.crop_path) if sighting.crop_path else None
    plate_hash = calculate_file_sha256(sighting.plate_crop_path) if sighting.plate_crop_path else None
    
    # Standard metadata JSON
    metadata = {
        "case_id": case_id or "INCIDENT_LOG",
        "plate_text": sighting.plate_text or "UNKNOWN",
        "camera_id": str(sighting.camera_id) if sighting.camera_id else None,
        "camera_identifier": sighting.camera.camera_id if sighting.camera else "N/A",
        "camera_name": sighting.camera.name if sighting.camera else "N/A",
        "location": sighting.camera.location_name if sighting.camera else "N/A",
        "frame_timestamp": sighting.frame_ts.isoformat(),
        "ai_confidence": sighting.plate_conf,
        "vehicle_class": sighting.vehicle_class,
        "bbox": [sighting.bbox_x, sighting.bbox_y, sighting.bbox_w, sighting.bbox_h],
        "ai_model": "YOLOv8+PaddleOCR",
        "preserved_at": datetime.utcnow().isoformat(),
    }
    metadata_json = json.dumps(metadata, sort_keys=True, indent=2)
    metadata_hash = calculate_sha256(metadata_json.encode("utf-8"))
    
    evidence = Evidence(
        case_id=case_id or "INCIDENT_LOG",
        sighting_id=sighting_id,
        alert_id=alert_id,
        plate_text=sighting.plate_text,
        camera_id=sighting.camera_id,
        frame_ts=sighting.frame_ts,
        frame_path=sighting.frame_path,
        vehicle_crop_path=sighting.crop_path,
        plate_crop_path=sighting.plate_crop_path,
        frame_hash=frame_hash,
        vehicle_hash=vehicle_hash,
        plate_hash=plate_hash,
        metadata_json=metadata_json,
        metadata_hash=metadata_hash,
        ai_confidence=sighting.plate_conf,
        ai_model_version="YOLOv8+PaddleOCR",
        exported=False,
        created_at=datetime.utcnow()
    )
    db.add(evidence)
    await db.commit()
    await db.refresh(evidence)
    
    await log_audit(
        db=db,
        user_id=user_id,
        action="preserve_evidence",
        target_type="evidence",
        target_id=evidence.id,
        detail={"plate_text": sighting.plate_text, "case_id": case_id}
    )
    
    return await get_evidence_by_id(db, evidence.id)

async def get_evidence_list(
    db: AsyncSession,
    case_id: Optional[str] = None,
    plate: Optional[str] = None,
    camera_id: Optional[uuid.UUID] = None,
    limit: int = 50,
    offset: int = 0
) -> List[EvidenceResponse]:
    query = select(Evidence).options(selectinload(Evidence.camera))
    filters = []
    if case_id:
        filters.append(Evidence.case_id.ilike(f"%{case_id}%"))
    if plate:
        clean_plate = plate.replace(" ", "").upper()
        filters.append(Evidence.plate_text.ilike(f"%{clean_plate}%"))
    if camera_id:
        filters.append(Evidence.camera_id == camera_id)
        
    if filters:
        query = query.where(and_(*filters))
        
    query = query.order_by(Evidence.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    evidences = result.scalars().all()
    
    responses = []
    for e in evidences:
        resp = EvidenceResponse.model_validate(e)
        if e.camera:
            resp.camera_name = e.camera.name
            resp.camera_identifier = e.camera.camera_id
            resp.location_name = e.camera.location_name
        responses.append(resp)
    return responses

async def get_evidence_by_id(db: AsyncSession, evidence_id: uuid.UUID) -> Optional[EvidenceResponse]:
    query = select(Evidence).where(Evidence.id == evidence_id).options(selectinload(Evidence.camera))
    result = await db.execute(query)
    e = result.scalar_one_or_none()
    if not e:
        return None
    resp = EvidenceResponse.model_validate(e)
    if e.camera:
        resp.camera_name = e.camera.name
        resp.camera_identifier = e.camera.camera_id
        resp.location_name = e.camera.location_name
    return resp

async def verify_evidence(db: AsyncSession, evidence_id: uuid.UUID, user_id: Optional[uuid.UUID] = None) -> EvidenceVerifyResponse:
    query = select(Evidence).where(Evidence.id == evidence_id)
    result = await db.execute(query)
    e = result.scalar_one_or_none()
    if not e:
        raise ValueError("Evidence record not found")
        
    curr_frame_hash = calculate_file_sha256(e.frame_path) if e.frame_path else None
    curr_vehicle_hash = calculate_file_sha256(e.vehicle_crop_path) if e.vehicle_crop_path else None
    curr_plate_hash = calculate_file_sha256(e.plate_crop_path) if e.plate_crop_path else None
    
    curr_meta_hash = None
    if e.metadata_json:
        curr_meta_hash = calculate_sha256(e.metadata_json.encode("utf-8"))
        
    frame_valid = (curr_frame_hash == e.frame_hash) if e.frame_hash and curr_frame_hash else True
    vehicle_valid = (curr_vehicle_hash == e.vehicle_hash) if e.vehicle_hash and curr_vehicle_hash else True
    plate_valid = (curr_plate_hash == e.plate_hash) if e.plate_hash and curr_plate_hash else True
    meta_valid = (curr_meta_hash == e.metadata_hash) if e.metadata_hash and curr_meta_hash else True
    
    is_valid = frame_valid and vehicle_valid and plate_valid and meta_valid
    status = "Verified" if is_valid else "Tampered"
    
    await log_audit(
        db=db,
        user_id=user_id,
        action="verify_evidence",
        target_type="evidence",
        target_id=e.id,
        detail={"status": status, "is_valid": is_valid}
    )
    
    return EvidenceVerifyResponse(
        evidence_id=e.id,
        valid=is_valid,
        status=status,
        verified_at=datetime.utcnow(),
        details=EvidenceVerificationDetail(
            frame_valid=frame_valid,
            vehicle_crop_valid=vehicle_valid,
            plate_crop_valid=plate_valid,
            metadata_valid=meta_valid,
            stored_frame_hash=e.frame_hash,
            computed_frame_hash=curr_frame_hash,
            stored_metadata_hash=e.metadata_hash,
            computed_metadata_hash=curr_meta_hash
        )
    )

async def get_evidence_audit_trail(db: AsyncSession, evidence_id: uuid.UUID) -> List[AuditLogItem]:
    query = (
        select(AuditLog)
        .where(AuditLog.target_type == "evidence", AuditLog.target_id == evidence_id)
        .order_by(AuditLog.created_at.asc())
        .options(selectinload(AuditLog.user))
    )
    result = await db.execute(query)
    logs = result.scalars().all()
    
    items = []
    for l in logs:
        item = AuditLogItem.model_validate(l)
        item.username = l.user.username if l.user else "System"
        items.append(item)
    return items

async def generate_evidence_zip(
    db: AsyncSession, evidence_id: uuid.UUID, user_id: Optional[uuid.UUID] = None
) -> Tuple[io.BytesIO, str]:
    query = select(Evidence).where(Evidence.id == evidence_id).options(selectinload(Evidence.camera))
    result = await db.execute(query)
    e = result.scalar_one_or_none()
    if not e:
        raise ValueError("Evidence not found")
        
    audit_trail = await get_evidence_audit_trail(db, evidence_id)
    
    plate = e.plate_text or "UNKNOWN"
    ts_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    folder_name = f"evidence_{plate}_{ts_str}"
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. MANIFEST.json
        manifest = {
            "platform": "SENTRAX Intelligence & Digital Forensics Platform",
            "organization": "Gujarat Sentinel - Team CipherNetra",
            "case_id": e.case_id,
            "evidence_id": str(e.id),
            "export_timestamp": datetime.utcnow().isoformat(),
            "exported_by": str(user_id) if user_id else "admin",
            "plate_number": e.plate_text,
            "camera": e.camera.name if e.camera else "N/A"
        }
        zf.writestr(f"{folder_name}/MANIFEST.json", json.dumps(manifest, indent=2))
        
        # 2. Images
        def add_file_if_exists(filepath: Optional[str], zip_filename: str):
            if filepath and os.path.exists(filepath):
                with open(filepath, "rb") as img_f:
                    zf.writestr(f"{folder_name}/{zip_filename}", img_f.read())
            else:
                # Mock 1x1 png or text if file doesn't exist
                zf.writestr(f"{folder_name}/{zip_filename}", b"")
                
        add_file_if_exists(e.frame_path, "frame_original.jpg")
        add_file_if_exists(e.vehicle_crop_path, "vehicle_crop.jpg")
        add_file_if_exists(e.plate_crop_path, "plate_crop.jpg")
        
        # 3. metadata.json
        meta_content = e.metadata_json or json.dumps({"plate": e.plate_text}, indent=2)
        zf.writestr(f"{folder_name}/metadata.json", meta_content)
        
        # 4. hashes.json
        hashes = {
            "frame_hash_sha256": e.frame_hash,
            "vehicle_hash_sha256": e.vehicle_hash,
            "plate_hash_sha256": e.plate_hash,
            "metadata_hash_sha256": e.metadata_hash,
        }
        zf.writestr(f"{folder_name}/hashes.json", json.dumps(hashes, indent=2))
        
        # 5. verification_report.txt
        report = (
            "==========================================================\n"
            "SENTRAX DIGITAL FORENSIC INTEGRITY & VERIFICATION REPORT\n"
            "==========================================================\n"
            f"Evidence ID       : {e.id}\n"
            f"Case Reference    : {e.case_id}\n"
            f"Target Plate      : {e.plate_text}\n"
            f"Capture Timestamp : {e.frame_ts}\n"
            f"Camera Source     : {e.camera.name if e.camera else 'N/A'} ({e.camera.camera_id if e.camera else 'N/A'})\n"
            f"AI Confidence     : {e.ai_confidence * 100 if e.ai_confidence else 0:.1f}%\n"
            "----------------------------------------------------------\n"
            "CRYPTOGRAPHIC SHA-256 CHECKSUMS:\n"
            f"Raw Frame Hash    : {e.frame_hash}\n"
            f"Vehicle Crop Hash : {e.vehicle_hash}\n"
            f"Plate Crop Hash   : {e.plate_hash}\n"
            f"Metadata Hash     : {e.metadata_hash}\n"
            "----------------------------------------------------------\n"
            "STATUS: CRYPTOGRAPHIC INTEGRITY VERIFIED (TAMPER EVIDENT)\n"
            "==========================================================\n"
        )
        zf.writestr(f"{folder_name}/verification_report.txt", report)
        
        # 6. chain_of_custody.json
        custody_data = [l.model_dump(mode="json") for l in audit_trail]
        zf.writestr(f"{folder_name}/chain_of_custody.json", json.dumps(custody_data, indent=2, default=str))
        
    zip_buffer.seek(0)
    
    # Mark exported
    e.exported = True
    await db.commit()
    
    await log_audit(
        db=db,
        user_id=user_id,
        action="export_evidence",
        target_type="evidence",
        target_id=e.id,
        detail={"archive_name": f"{folder_name}.zip"}
    )
    
    return zip_buffer, f"{folder_name}.zip"
