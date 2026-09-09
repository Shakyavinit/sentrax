from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
from backend.app.core.database import get_db
from backend.app.models.camera import Camera, CameraStatus
from backend.app.models.user import User, UserRole
from backend.app.models.audit import AuditLog
from backend.app.schemas.camera import CameraCreate, CameraUpdate, CameraOut
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.get("", response_model=List[CameraOut])
def list_cameras(
    status: Optional[CameraStatus] = None,
    department: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Camera)
    if status:
        query = query.filter(Camera.status == status)
    if department:
        query = query.filter(Camera.department.ilike(f"%{department}%"))
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=CameraOut, dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPERVISOR))])
def register_camera(
    camera_in: CameraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Camera).filter(Camera.camera_id == camera_in.camera_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Camera with ID '{camera_in.camera_id}' already registered")

    # PostGIS Point (WGS84 SRID 4326) format is POINT(lon lat)
    geom_wkt = f"SRID=4326;POINT({camera_in.longitude} {camera_in.latitude})"

    camera = Camera(
        camera_id=camera_in.camera_id,
        name=camera_in.name,
        department=camera_in.department,
        latitude=camera_in.latitude,
        longitude=camera_in.longitude,
        address=camera_in.address,
        vendor=camera_in.vendor,
        vms_type=camera_in.vms_type,
        source_type=camera_in.source_type,
        stream_url=camera_in.stream_url,
        status=camera_in.status,
        last_seen=datetime.now(timezone.utc) if camera_in.status == CameraStatus.ONLINE else None,
        location=WKTElement(f"POINT({camera_in.longitude} {camera_in.latitude})", srid=4326)
    )
    db.add(camera)
    db.commit()
    db.refresh(camera)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="REGISTER_CAMERA",
        target_resource="cameras",
        target_id=camera.camera_id,
        details={"name": camera.name, "location": [camera.latitude, camera.longitude]}
    )
    db.add(audit)
    db.commit()

    return camera


@router.get("/{camera_id}", response_model=CameraOut)
def get_camera_by_id(
    camera_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.put("/{camera_id}", response_model=CameraOut, dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPERVISOR))])
def update_camera(
    camera_id: str,
    update_data: CameraUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(camera, field, val)

    if update_data.latitude is not None or update_data.longitude is not None:
        camera.location = WKTElement(f"POINT({camera.longitude} {camera.latitude})", srid=4326)
    
    if camera.status == CameraStatus.ONLINE:
        camera.last_seen = datetime.now(timezone.utc)

    db.commit()
    db.refresh(camera)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="UPDATE_CAMERA",
        target_resource="cameras",
        target_id=camera.camera_id,
        details=update_dict
    )
    db.add(audit)
    db.commit()

    return camera


@router.delete("/{camera_id}", dependencies=[Depends(require_roles(UserRole.ADMIN))])
def delete_camera(
    camera_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    db.delete(camera)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="DELETE_CAMERA",
        target_resource="cameras",
        target_id=camera_id,
        details={"camera_name": camera.name}
    )
    db.add(audit)
    db.commit()

    return {"status": "deleted", "camera_id": camera_id}
