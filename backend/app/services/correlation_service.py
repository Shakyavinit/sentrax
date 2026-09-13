import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.sighting import Sighting
from app.models.camera import Camera
from app.models.correlation import Correlation
from app.services.vehicle_service import haversine_distance_km
from app.core.logging import logger

def validate_journey_feasibility(sightings: List[Sighting]) -> List[Sighting]:
    if len(sightings) < 2:
        return sightings
        
    valid = [sightings[0]]
    for curr in sightings[1:]:
        prev = valid[-1]
        time_diff_hours = (curr.frame_ts - prev.frame_ts).total_seconds() / 3600.0
        
        # If consecutive sightings are within 1 second on different cameras that are far apart
        if prev.camera and curr.camera and prev.camera.latitude and curr.camera.latitude:
            dist_km = haversine_distance_km(
                prev.camera.latitude, prev.camera.longitude,
                curr.camera.latitude, curr.camera.longitude
            )
            if time_diff_hours > 0:
                speed_kmh = dist_km / time_diff_hours
                if speed_kmh > 200:  # Physically implausible for city traffic
                    logger.warning(f"Speed check failed ({speed_kmh:.1f} km/h) between {prev.camera.camera_id} and {curr.camera.camera_id}")
                    continue
        valid.append(curr)
    return valid

def calculate_correlation_confidence(sightings: List[Sighting]) -> float:
    confs = [s.plate_conf for s in sightings if s.plate_conf is not None]
    if not confs:
        return 0.85
    return round(sum(confs) / len(confs), 2)

async def correlate_vehicle(db: AsyncSession, plate_text: str, window_hours: int = 24) -> Optional[Correlation]:
    clean_plate = plate_text.replace(" ", "").upper()
    since = datetime.utcnow() - timedelta(hours=window_hours)
    
    res = await db.execute(
        select(Sighting)
        .where(and_(Sighting.plate_text == clean_plate, Sighting.frame_ts >= since))
        .order_by(Sighting.frame_ts.asc())
        .options(selectinload(Sighting.camera))
    )
    sightings = res.scalars().all()
    if len(sightings) < 2:
        return None
        
    distinct_cameras = {s.camera_id for s in sightings if s.camera_id}
    if len(distinct_cameras) < 2:
        return None
        
    valid_path = validate_journey_feasibility(sightings)
    if len(valid_path) < 2:
        return None
        
    # Build WKT LineString
    coords_wkt = []
    for s in valid_path:
        if s.camera and s.camera.longitude and s.camera.latitude:
            coords_wkt.append(f"{s.camera.longitude} {s.camera.latitude}")
    path_wkt = f"LINESTRING({', '.join(coords_wkt)})" if coords_wkt else None
    
    start_ts = valid_path[0].frame_ts
    end_ts = valid_path[-1].frame_ts
    dur_mins = round((end_ts - start_ts).total_seconds() / 60.0, 1)
    
    correlation = Correlation(
        plate_text=clean_plate,
        sighting_ids=[str(s.id) for s in valid_path],
        camera_ids=[str(s.camera_id) for s in valid_path if s.camera_id],
        start_ts=start_ts,
        end_ts=end_ts,
        duration_mins=dur_mins,
        correlation_method="plate_match",
        confidence=calculate_correlation_confidence(valid_path),
        path_wkt=path_wkt,
        created_at=datetime.utcnow()
    )
    db.add(correlation)
    await db.commit()
    await db.refresh(correlation)
    return correlation
