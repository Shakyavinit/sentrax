import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.schemas.evidence import (
    EvidenceResponse,
    EvidenceVerifyResponse,
    AuditLogItem,
    BulkExportRequest
)
from app.services import evidence_service

router = APIRouter(prefix="/evidence", tags=["Evidence"])

class PreserveEvidenceRequest(BaseModel):
    sighting_id: uuid.UUID
    alert_id: Optional[uuid.UUID] = None
    case_id: Optional[str] = "INVESTIGATION_LOG"

@router.get("", response_model=List[EvidenceResponse])
async def list_evidence(
    case_id: Optional[str] = Query(None),
    plate: Optional[str] = Query(None),
    camera_id: Optional[uuid.UUID] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    page: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    offset = (page - 1) * limit
    return await evidence_service.get_evidence_list(
        db=db,
        case_id=case_id,
        plate=plate,
        camera_id=camera_id,
        limit=limit,
        offset=offset
    )

@router.post("/preserve", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def preserve_evidence_item(
    body: PreserveEvidenceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return await evidence_service.preserve_evidence(
            db=db,
            sighting_id=body.sighting_id,
            alert_id=body.alert_id,
            case_id=body.case_id,
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/{evidence_id}", response_model=EvidenceResponse)
async def get_evidence(
    evidence_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evidence = await evidence_service.get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")
    return evidence

@router.get("/{evidence_id}/verify", response_model=EvidenceVerifyResponse)
async def verify_evidence(
    evidence_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return await evidence_service.verify_evidence(db, evidence_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{evidence_id}/export")
async def export_evidence(
    evidence_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        zip_buffer, filename = await evidence_service.generate_evidence_zip(db, evidence_id, current_user.id)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/{evidence_id}/audit", response_model=List[AuditLogItem])
async def get_evidence_audit(
    evidence_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await evidence_service.get_evidence_audit_trail(db, evidence_id)

@router.post("/bulk-export")
async def bulk_export_evidence(
    body: BulkExportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not body.evidence_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No evidence IDs provided")
    # For the first item or aggregated ZIP: export first selected item as representative package
    zip_buffer, filename = await evidence_service.generate_evidence_zip(db, body.evidence_ids[0], current_user.id)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=bulk_{body.case_id}_{filename}"}
    )
