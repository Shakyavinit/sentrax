import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from backend.app.core.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SUPERVISOR = "SUPERVISOR"
    ANALYST = "ANALYST"
    OFFICER = "OFFICER"
    INVESTIGATOR = "INVESTIGATOR"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    badge_number = Column(String(100), unique=True, index=True, nullable=True)
    department = Column(String(255), nullable=False, default="Gujarat Police")
    role = Column(Enum(UserRole), nullable=False, default=UserRole.OFFICER)
    is_active = Column(Boolean(), default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime(timezone=True), nullable=True)
