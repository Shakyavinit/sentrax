import asyncio
import time
import cv2
from datetime import datetime
from typing import Optional
from app.core.logging import logger

class RTSPReader:
    """
    Reads frames from an RTSP stream robustly.
    Handles: connection failures, frame gaps, variable FPS, automatic reconnect.
    """
    def __init__(self, url: str, camera_id: str, queue: asyncio.Queue):
        self.url = url
        self.camera_id = camera_id
        self.queue = queue
        self.cap = None
        self.is_running = False
        self.reconnect_delay = 5  # seconds
        self.max_reconnect = 10
        self.fps_target = 5       # Process 5 FPS regardless of source FPS

    async def start(self):
        self.is_running = True
        consecutive_errors = 0
        while self.is_running:
            try:
                await self._connect()
                consecutive_errors = 0
                await self._read_loop()
            except Exception as e:
                consecutive_errors += 1
                logger.warning(f"[{self.camera_id}] RTSP Stream error ({e}). Retry {consecutive_errors}/{self.max_reconnect}")
                if consecutive_errors >= self.max_reconnect:
                    logger.error(f"[{self.camera_id}] Exceeded max reconnect attempts. Backing off.")
                await asyncio.sleep(self.reconnect_delay)

    async def _connect(self):
        # Prefer FFmpeg backend for robust RTSP
        self.cap = cv2.VideoCapture(self.url, cv2.CAP_FFMPEG)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
        if not self.cap.isOpened():
            raise ConnectionError(f"Cannot open RTSP feed: {self.url}")
        logger.info(f"[{self.camera_id}] Connected to RTSP stream.")

    async def _read_loop(self):
        frame_interval = 1.0 / self.fps_target
        last_frame_time = 0

        while self.is_running and self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                raise ConnectionError("RTSP frame read returned false")

            now = time.time()
            if now - last_frame_time >= frame_interval:
                last_frame_time = now
                if not self.queue.full():
                    await self.queue.put({
                        'frame': frame,
                        'camera_id': self.camera_id,
                        'timestamp': datetime.utcnow()
                    })
            await asyncio.sleep(0.01)

    def stop(self):
        self.is_running = False
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None
