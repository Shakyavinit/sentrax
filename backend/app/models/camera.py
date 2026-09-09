import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from geoalchemy2 import Geometry
from backend.app.core.database import Base


class CameraStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    MAINTENANCE = "MAINTENANCE"
    DEGRADED = "DEGRADED"


class CameraSourceType(str, enum.Enum):
    RTSP = "RTSP"
    MP4_LOCAL = "MP4_LOCAL"
    MP4_UPLOAD = "MP4_UPLOAD"
    HTTP_STREAM = "HTTP_STREAM"


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(String(100), unique=True, index=True, nullable=False) # e.g. "GJ-AHM-SG-01"
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False, default="Ahmedabad Police")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=False)
    vendor = Column(String(100), nullable=True, default="Hikvision")
    vms_type = Column(String(100), nullable=True, default="Milestone")
    source_type = Column(Enum(CameraSourceType), nullable=False, default=CameraSourceType.RTSP)
    stream_url = Column(String(1000), nullable=False)
    status = Column(Enum(CameraStatus), nullable=False, default=CameraStatus.OFFLINE)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Spatial representation for PostGIS queries (SRID 4326 - WGS84)
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
