from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.video_source import VideoSource, VideoSourceStatus
from backend.app.models.camera import Camera
from backend.app.models.user import User, UserRole
from backend.app.models.audit import AuditLog
from backend.app.schemas.video_source import VideoSourceCreate, VideoSourceOut, VideoSourceStatusOut
from backend.app.services.stream_worker import stream_worker_manager
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.get("", response_model=List[VideoSourceOut])
def list_video_sources(
    status: Optional[VideoSourceStatus] = None,
    camera_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(VideoSource)
    if status:
        query = query.filter(VideoSource.status == status)
    if camera_id:
        query = query.filter(VideoSource.camera_id == camera_id)
    return query.order_by(VideoSource.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=VideoSourceOut, dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.ANALYST))])
def create_video_source(
    source_in: VideoSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify camera exists
    camera = db.query(Camera).filter(Camera.camera_id == source_in.camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail=f"Camera '{source_in.camera_id}' not found in registry")

    source = VideoSource(
        name=source_in.name,
        camera_id=source_in.camera_id,
        source_type=source_in.source_type,
        url=source_in.url,
        target_fps=source_in.target_fps or 5.0,
        status=VideoSourceStatus.STOPPED,
        frames_processed=0
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="CREATE_VIDEO_SOURCE",
        target_resource="video_sources",
        target_id=str(source.id),
        details={"name": source.name, "url": source.url, "source_type": source.source_type.value}
    )
    db.add(audit)
    db.commit()

    return source


@router.post("/{source_id}/start")
def start_video_stream(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    source = db.query(VideoSource).filter(VideoSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Video source not found")

    try:
        stream_worker_manager.start_source(source_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start streaming: {str(e)}")

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="START_STREAM_INGESTION",
        target_resource="video_sources",
        target_id=str(source_id),
        details={"url": source.url, "camera_id": source.camera_id}
    )
    db.add(audit)
    db.commit()

    return {"status": "started", "source_id": source_id, "mode": "INCREMENTAL_STREAMING"}


@router.post("/{source_id}/stop")
def stop_video_stream(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    source = db.query(VideoSource).filter(VideoSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Video source not found")

    stream_worker_manager.stop_source(source_id, db)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="STOP_STREAM_INGESTION",
        target_resource="video_sources",
        target_id=str(source_id),
        details={"camera_id": source.camera_id}
    )
    db.add(audit)
    db.commit()

    return {"status": "stopped", "source_id": source_id}


@router.get("/{source_id}/status", response_model=VideoSourceStatusOut)
def get_video_source_status(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return stream_worker_manager.get_status(source_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Video source not found")
