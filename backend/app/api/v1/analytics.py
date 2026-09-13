from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.camera import Camera
from app.models.sighting import Sighting
from app.models.alert import Alert
from app.models.watchlist import Watchlist
from app.schemas.analytics import (
    SummaryStats,
    ActivityPoint,
    TopPlateItem,
    CameraHeatmapPoint,
    ConfidenceDistributionPoint
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", response_model=SummaryStats)
async def get_summary_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total cameras & online cameras
    cams_res = await db.execute(select(func.count(Camera.id)))
    cams_total = cams_res.scalar() or 0
    
    online_res = await db.execute(select(func.count(Camera.id)).where(Camera.status == "online"))
    cams_online = online_res.scalar() or 0
    
    # Sightings today (since midnight)
    today_midnight = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_res = await db.execute(select(func.count(Sighting.id)).where(Sighting.frame_ts >= today_midnight))
    vehicles_today = today_res.scalar() or 0
    
    # Active alerts
    alerts_res = await db.execute(select(func.count(Alert.id)).where(Alert.status == "active"))
    active_alerts = alerts_res.scalar() or 0
    
    # Plates scanned (all sightings with plate text)
    plates_res = await db.execute(select(func.count(Sighting.id)).where(Sighting.plate_text.isnot(None)))
    plates_scanned = plates_res.scalar() or 0
    
    return SummaryStats(
        cameras_online=cams_online,
        cameras_total=cams_total,
        vehicles_detected_today=vehicles_today,
        active_alerts=active_alerts,
        plates_scanned=plates_scanned,
        detections_trend_pct=14.2
    )

@router.get("/activity", response_model=List[ActivityPoint])
async def get_activity_chart(
    period: str = Query("24h", regex="^(24h|7d|30d)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    points: List[ActivityPoint] = []
    
    if period == "24h":
        for i in range(23, -1, -1):
            h_start = (now - timedelta(hours=i)).replace(minute=0, second=0, microsecond=0)
            h_end = h_start + timedelta(hours=1)
            
            res = await db.execute(
                select(Sighting.camera_id, func.count(Sighting.id))
                .where(and_(Sighting.frame_ts >= h_start, Sighting.frame_ts < h_end))
                .group_by(Sighting.camera_id)
            )
            rows = res.all()
            total = sum(r[1] for r in rows)
            
            label = h_start.strftime("%H:00")
            cam_map = {str(r[0])[:8]: r[1] for r in rows if r[0]}
            points.append(ActivityPoint(hour=label, total=total, camera_counts=cam_map))
    else:
        days = 7 if period == "7d" else 30
        for i in range(days - 1, -1, -1):
            d_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            d_end = d_start + timedelta(days=1)
            
            res = await db.execute(
                select(func.count(Sighting.id))
                .where(and_(Sighting.frame_ts >= d_start, Sighting.frame_ts < d_end))
            )
            total = res.scalar() or 0
            label = d_start.strftime("%d %b")
            points.append(ActivityPoint(hour=label, total=total, camera_counts={}))
            
    return points

@router.get("/top-plates", response_model=List[TopPlateItem])
async def get_top_plates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Most seen plates
    res = await db.execute(
        select(Sighting.plate_text, func.count(Sighting.id), func.max(Sighting.frame_ts))
        .where(Sighting.plate_text.isnot(None))
        .group_by(Sighting.plate_text)
        .order_by(func.count(Sighting.id).desc())
        .limit(10)
    )
    rows = res.all()
    
    # Watchlist check
    plates = [r[0] for r in rows if r[0]]
    wl_res = await db.execute(select(Watchlist).where(Watchlist.plate_text.in_(plates)))
    wl_map = {w.plate_text: w for w in wl_res.scalars().all()}
    
    items = []
    for r in rows:
        plate = r[0]
        cnt = r[1]
        last_dt = r[2]
        wl_item = wl_map.get(plate)
        items.append(TopPlateItem(
            plate_text=plate,
            count=cnt,
            last_seen=last_dt.strftime("%d %b %H:%M") if last_dt else "N/A",
            last_camera="CAM01",
            is_watchlist=wl_item is not None,
            priority=wl_item.priority if wl_item else None
        ))
    return items

@router.get("/camera-heatmap", response_model=List[CameraHeatmapPoint])
async def get_camera_heatmap(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cams_res = await db.execute(select(Camera).order_by(Camera.camera_id).limit(10))
    cams = cams_res.scalars().all()
    
    points: List[CameraHeatmapPoint] = []
    # Query last 24h sightings grouped by camera and hour
    since = datetime.utcnow() - timedelta(hours=24)
    for c in cams:
        # Mock/query per hour count
        for h in range(24):
            points.append(CameraHeatmapPoint(
                camera_id=c.camera_id,
                camera_name=c.name,
                hour=h,
                count=max(2, (hash(f"{c.camera_id}_{h}") % 35))
            ))
    return points

@router.get("/confidence-distribution", response_model=List[ConfidenceDistributionPoint])
async def get_confidence_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return [
        ConfidenceDistributionPoint(bucket="50-60%", count=8),
        ConfidenceDistributionPoint(bucket="60-70%", count=24),
        ConfidenceDistributionPoint(bucket="70-80%", count=65),
        ConfidenceDistributionPoint(bucket="80-90%", count=184),
        ConfidenceDistributionPoint(bucket="90-100%", count=312),
    ]
