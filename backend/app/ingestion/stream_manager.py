import uuid
import asyncio
from typing import Dict, Optional
from sqlalchemy import select
from app.models.camera import Camera
from app.core.database import AsyncSessionLocal
from app.ingestion.rtsp_reader import RTSPReader
from app.ingestion.frame_processor import frame_queue
from app.core.logging import logger

class StreamManager:
    """Manages active camera stream reader background tasks."""
    def __init__(self):
        self.readers: Dict[str, RTSPReader] = {}
        self.tasks: Dict[str, asyncio.Task] = {}
        self.status: Dict[str, str] = {}

    async def start_camera(self, camera: Camera):
        cam_key = str(camera.id)
        if cam_key in self.readers:
            await self.stop_camera(cam_key)

        reader = RTSPReader(camera.rtsp_url, camera.camera_id, frame_queue)
        self.readers[cam_key] = reader
        task = asyncio.create_task(reader.start())
        self.tasks[cam_key] = task
        self.status[cam_key] = 'starting'
        logger.info(f"Started ingestion for camera {camera.camera_id}")

    async def stop_camera(self, camera_id: str):
        if camera_id in self.readers:
            self.readers[camera_id].stop()
            del self.readers[camera_id]
        if camera_id in self.tasks:
            self.tasks[camera_id].cancel()
            del self.tasks[camera_id]
        self.status[camera_id] = 'stopped'

    async def start_all(self):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Camera).where(Camera.status == "online"))
            cameras = result.scalars().all()
            for cam in cameras:
                await self.start_camera(cam)

    def get_status(self) -> Dict[str, str]:
        return self.status

stream_manager = StreamManager()
