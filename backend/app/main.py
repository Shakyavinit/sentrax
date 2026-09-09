import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.app.core.config import settings
from backend.app.core.database import engine, SessionLocal, Base
from backend.app.core import security
from backend.app.models.user import User, UserRole
from backend.app.models.camera import Camera
from backend.app.models.watchlist import Watchlist
from backend.app.models.sighting import Sighting
from backend.app.models.alert import Alert
from backend.app.models.evidence import Evidence
from backend.app.models.audit import AuditLog
from backend.app.models.video_source import VideoSource

from backend.app.api.v1 import auth, cameras, watchlist, sightings, alerts, evidence, audit, ws, video_sources

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentrax")


def init_db():
    logger.info("Initializing PostGIS tables...")
    Base.metadata.create_all(bind=engine)

    # Seed Default Initial Admin if not present
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.INITIAL_ADMIN_EMAIL).first()
        if not admin_user:
            logger.info(f"Seeding Initial Command Center Admin: {settings.INITIAL_ADMIN_EMAIL}")
            admin = User(
                email=settings.INITIAL_ADMIN_EMAIL,
                hashed_password=security.get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
                full_name=settings.INITIAL_ADMIN_NAME,
                badge_number=settings.INITIAL_ADMIN_BADGE,
                department="Gujarat State Police Headquarter",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            logger.info("Admin seeded successfully.")
    except Exception as e:
        logger.error(f"Error during DB initialization: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.VIDEOS_DIR, exist_ok=True)
    os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)
    os.makedirs(settings.TEMP_DIR, exist_ok=True)
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "SENTRAX Intelligence Core",
        "version": "1.0.0-m1",
        "environment": settings.ENVIRONMENT,
        "storage": {
            "max_temp_mb": settings.MAX_TEMP_STORAGE_MB,
            "max_evidence_mb": settings.MAX_EVIDENCE_STORAGE_MB
        }
    }

# Include API Routers (supporting both /api/v1/ and direct /api/ for video sources as requested)
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication & RBAC"])
app.include_router(cameras.router, prefix=f"{settings.API_V1_STR}/cameras", tags=["Camera Registry"])
app.include_router(watchlist.router, prefix=f"{settings.API_V1_STR}/watchlist", tags=["Watchlist"])
app.include_router(sightings.router, prefix=f"{settings.API_V1_STR}/sightings", tags=["Sightings & Detections"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Real-time Alerts"])
app.include_router(evidence.router, prefix=f"{settings.API_V1_STR}/evidence", tags=["Forensic Evidence Vault"])
app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["Audit Trail"])
app.include_router(ws.router, prefix=f"{settings.API_V1_STR}/ws", tags=["WebSockets"])

# Video Sources Endpoints: accessible via /api/v1/video-sources and directly /api/video-sources
app.include_router(video_sources.router, prefix=f"{settings.API_V1_STR}/video-sources", tags=["Video Sources"])
app.include_router(video_sources.router, prefix="/api/video-sources", tags=["Video Sources"])

# Mount static file access for /data directory (samples, evidence snapshots, clips)
app.mount("/data", StaticFiles(directory="/app/data"), name="data")

