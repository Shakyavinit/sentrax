from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SummaryStats(BaseModel):
    cameras_online: int
    cameras_total: int
    vehicles_detected_today: int
    active_alerts: int
    plates_scanned: int
    detections_trend_pct: Optional[float] = 12.5

class ActivityPoint(BaseModel):
    hour: str # "00:00", "01:00", ...
    total: int
    camera_counts: Dict[str, int] = {} # e.g. {"CAM01": 24, "CAM02": 18}

class TopPlateItem(BaseModel):
    plate_text: str
    count: int
    last_seen: str
    last_camera: str
    is_watchlist: bool
    priority: Optional[str] = None

class CameraHeatmapPoint(BaseModel):
    camera_id: str
    camera_name: str
    hour: int # 0-23
    count: int

class ConfidenceDistributionPoint(BaseModel):
    bucket: str # "50-60%", "60-70%", ...
    count: int
