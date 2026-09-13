import uuid
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.vehicle import VehicleSearchResponse, SightingResponse, VehicleJourneyResponse, VehicleDossierResponse
from app.services import vehicle_service

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("/search", response_model=VehicleSearchResponse)
async def search_vehicles(
    plate: Optional[str] = Query(None, description="License plate number"),
    camera_id: Optional[uuid.UUID] = Query(None),
    vehicle_class: Optional[str] = Query(None),
    from_date: Optional[datetime] = Query(None, alias="from"),
    to_date: Optional[datetime] = Query(None, alias="to"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await vehicle_service.search_sightings(
        db=db,
        plate=plate,
        camera_id=camera_id,
        vehicle_class=vehicle_class,
        from_ts=from_date,
        to_ts=to_date,
        limit=limit,
        offset=offset
    )

@router.get("/journey/{plate}", response_model=VehicleJourneyResponse)
async def get_vehicle_journey(
    plate: str,
    from_date: Optional[datetime] = Query(None, alias="from"),
    to_date: Optional[datetime] = Query(None, alias="to"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await vehicle_service.reconstruct_journey(
        db=db,
        plate=plate,
        from_ts=from_date,
        to_ts=to_date
    )

@router.get("/dossier/{plate}", response_model=VehicleDossierResponse)
async def get_vehicle_dossier(
    plate: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await vehicle_service.get_vehicle_dossier(db, plate)

@router.get("/sightings/{sighting_id}", response_model=SightingResponse)
async def get_sighting_detail(
    sighting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sighting = await vehicle_service.get_sighting_by_id(db, sighting_id)
    if not sighting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sighting not found")
    return sighting

