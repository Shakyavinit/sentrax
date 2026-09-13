from datetime import datetime
from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(64), nullable=False)  # 'viewed_evidence', 'exported', 'added_watchlist', etc.
    target_type = Column(String(32), nullable=True) # 'evidence', 'sighting', 'watchlist'
    target_id = Column(UUID(as_uuid=True), nullable=True)
    detail = Column(JSONB, default=dict)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    user = relationship("User")

Index("idx_audit_target", AuditLog.target_type, AuditLog.target_id)
Index("idx_audit_user_time", AuditLog.user_id, AuditLog.created_at.desc())
