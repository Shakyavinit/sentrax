import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.redis import init_redis, close_redis, get_redis
from app.core.security import get_password_hash
from app.models.user import User
from app.api.router import api_router
from sqlalchemy import select

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing SENTRAX Intelligence & Digital Forensics Backend...")
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
    os.makedirs(os.path.join(settings.MEDIA_ROOT, "frames"), exist_ok=True)
    os.makedirs(os.path.join(settings.MEDIA_ROOT, "crops"), exist_ok=True)
    os.makedirs(os.path.join(settings.MEDIA_ROOT, "plates"), exist_ok=True)

    # Initialize Redis
    await init_redis()

    # Create tables if not created
    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        # Postgis check (fails gracefully if not supported in local sqlite/dev)
        try:
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS postgis;'))
        except Exception:
            pass
        await conn.run_sync(Base.metadata.create_all)

    # Create default admin if not exists
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.username == settings.DEFAULT_ADMIN_USERNAME))
        if not res.scalar_one_or_none():
            admin = User(
                username=settings.DEFAULT_ADMIN_USERNAME,
                email="admin@ciphernetra.gov.in",
                password_hash=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                role="admin",
                is_active=True
            )
            db.add(admin)
            await db.commit()
            logger.info(f"Default admin created ({settings.DEFAULT_ADMIN_USERNAME})")

    # Start background live demo simulation stream
    from app.services.demo_stream import live_demo_generator_loop
    sim_task = asyncio.create_task(live_demo_generator_loop())

    yield

    # Shutdown
    logger.info("Shutting down SENTRAX backend...")
    sim_task.cancel()
    await close_redis()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CCTV Intelligence & Digital Forensics Platform — Team CipherNetra",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media mount
if os.path.exists(settings.MEDIA_ROOT):
    app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

# API routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    db_status = "unknown"
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as e:
        db_status = f"disconnected ({str(e)})"

    redis_status = "disconnected"
    redis = await get_redis()
    if redis:
        try:
            await redis.ping()
            redis_status = "connected"
        except Exception:
            pass

    return {
        "status": "ok",
        "database": db_status,
        "redis": redis_status,
        "version": settings.VERSION,
        "platform": "SENTRAX"
    }

@app.get(f"{settings.API_V1_STR}/health")
async def api_v1_health_check():
    return await health_check()

