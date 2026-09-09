import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey
from backend.app.core.database import Base


class WatchlistPriority(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class WatchlistCategory(str, enum.Enum):
    STOLEN_VEHICLE = "STOLEN_VEHICLE"
    SUSPECT_VEHICLE = "SUSPECT_VEHICLE"
    WARRANT = "WARRANT"
    TRAFFIC_OFFENDER = "TRAFFIC_OFFENDER"
    TERROR_SUSPECT = "TERROR_SUSPECT"
    VIP_ESCORT = "VIP_ESCORT"
    SPECIAL_INTEREST = "SPECIAL_INTEREST"


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_make = Column(String(100), nullable=True)
    vehicle_model = Column(String(100), nullable=True)
    vehicle_color = Column(String(50), nullable=True)
    owner_name = Column(String(255), nullable=True)
    fir_number = Column(String(100), nullable=True)
    case_reference = Column(String(100), nullable=True)
    category = Column(Enum(WatchlistCategory), nullable=False, default=WatchlistCategory.SUSPECT_VEHICLE)
    priority = Column(Enum(WatchlistPriority), nullable=False, default=WatchlistPriority.HIGH)
    reason = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))
