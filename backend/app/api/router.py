from fastapi import APIRouter
from app.api.v1 import auth, cameras, vehicles, watchlist, alerts, evidence, analytics, stream, copilot, system

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(cameras.router)
api_router.include_router(vehicles.router)
api_router.include_router(watchlist.router)
api_router.include_router(alerts.router)
api_router.include_router(evidence.router)
api_router.include_router(analytics.router)
api_router.include_router(stream.router)
api_router.include_router(copilot.router)
api_router.include_router(system.router)
