import os
import time
import cv2
import logging
from collections import deque
from enum import Enum
from typing import Generator, Tuple, Optional, List
import numpy as np

from backend.app.core.config import settings
from backend.app.core.storage import check_and_prune_temp_storage, check_evidence_quota, compute_sha256_hash

logger = logging.getLogger(__name__)


class StreamSourceType(str, Enum):
    LOCAL_MP4 = "LOCAL_MP4"
    REMOTE_URL = "REMOTE_URL"
    RTSP = "RTSP"
    HTTP_STREAM = "HTTP_STREAM"


class VideoStreamReader:
    """
    Production Incremental Video Stream Reader for SENTRAX.
    
    Architectural Constraints Met:
    1. Zero Full-Video Disk Downloads for remote URLs:
       - Uses direct OpenCV / FFmpeg streaming demuxer over HTTP/HTTPS/RTSP.
    2. Incremental frame processing:
       - Generator yields frames one-by-one with timestamp throttling.
    3. Configurable frame sampling:
       - Default 5 FPS (or custom user defined rate).
    4. Auto-resizing:
       - Downscales frames exceeding 1280x720 to preserve compute and memory.
    5. Rolling in-memory buffer:
       - Maintains circular deque of recent frames (5-10s duration) purely in RAM.
       - Discards older frames with zero disk footprint.
    6. Forensic Evidence Snapshot & Clip creation:
       - Writes only event snapshots or 5-10s clips to /app/data/evidence.
       - Computes SHA-256 for court-admissible verification.
    """
    def __init__(
        self,
        source_url_or_path: str,
        source_type: StreamSourceType,
        camera_id: str,
        target_fps: float = 5.0,
        buffer_duration_sec: int = 8
    ):
        self.source = source_url_or_path
        self.source_type = source_type
        self.camera_id = camera_id
        self.target_fps = target_fps or settings.DEFAULT_STREAM_FPS
        self.sample_interval = 1.0 / self.target_fps

        # Circular in-memory rolling buffer (holds at most buffer_duration_sec * target_fps frames)
        max_buffer_len = max(10, int(buffer_duration_sec * self.target_fps))
        self.rolling_frame_buffer: deque = deque(maxlen=max_buffer_len)

        self.cap: Optional[cv2.VideoCapture] = None
        self.frames_processed = 0
        self.is_running = False
        self._last_sample_time = 0.0

    def open(self) -> bool:
        logger.info(f"Connecting to video stream [{self.camera_id}] ({self.source_type}) -> {self.source}")
        
        if self.source_type == StreamSourceType.LOCAL_MP4:
            if not os.path.exists(self.source):
                logger.error(f"Local MP4 not found: {self.source}")
                return False

        # OpenCV with FFmpeg backend automatically handles streaming HTTP/HTTPS and RTSP
        # without downloading the full container to local disk!
        self.cap = cv2.VideoCapture(self.source)
        if not self.cap or not self.cap.isOpened():
            logger.error(f"Failed to initialize stream for {self.camera_id} from {self.source}")
            return False

        self.is_running = True
        return True

    def _resize_frame(self, frame: np.ndarray) -> np.ndarray:
        h, w = frame.shape[:2]
        max_w, max_h = settings.MAX_FRAME_WIDTH, settings.MAX_FRAME_HEIGHT
        if w > max_w or h > max_h:
            scale = min(max_w / w, max_h / h)
            new_w, new_h = int(w * scale), int(h * scale)
            return cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
        return frame

    def read_sampled_frames(self) -> Generator[Tuple[int, np.ndarray, float], None, None]:
        """
        Yields (frame_index, resized_frame, timestamp) at the target FPS.
        Maintains rolling in-memory buffer and prunes temporary storage if any.
        """
        if not self.cap or not self.cap.isOpened():
            if not self.open():
                return

        frame_idx = 0
        # Determine video source native fps if available
        native_fps = self.cap.get(cv2.CAP_PROP_FPS)
        if not native_fps or native_fps <= 0 or native_fps > 120:
            native_fps = 25.0

        sample_every_n = max(1, int(round(native_fps / self.target_fps)))
        raw_counter = 0

        while self.is_running and self.cap.isOpened():
            loop_start = time.time()
            ret, raw_frame = self.cap.read()
            if not ret:
                logger.info(f"Stream end or EOF reached for camera {self.camera_id}")
                break

            raw_counter += 1
            if raw_counter % sample_every_n != 0:
                continue

            frame_idx += 1
            self.frames_processed = frame_idx
            now = time.time()

            # Downscale if exceeding 1280x720
            processed_frame = self._resize_frame(raw_frame)

            # Push to in-memory circular buffer (never touches disk unless alert is flagged)
            self.rolling_frame_buffer.append((frame_idx, processed_frame.copy(), now))

            # Periodically verify temporary directory limits
            if frame_idx % 25 == 0:
                check_and_prune_temp_storage()

            yield (frame_idx, processed_frame, now)

            # Throttle stream reading to target_fps rate to simulate live feed ingestion
            elapsed = time.time() - loop_start
            sleep_time = self.sample_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)

    def save_forensic_snapshot(self, frame: np.ndarray, event_id: str) -> Optional[Tuple[str, str, int]]:
        """
        Saves ONLY the event snapshot (single frame) to evidence vault.
        Computes SHA-256 for cryptographic integrity.
        Returns (relative_file_path, sha256_hash, file_size_bytes)
        """
        if not check_evidence_quota():
            logger.error("Refusing to save snapshot: evidence storage quota exceeded.")
            return None

        filename = f"snap_{self.camera_id}_{event_id}_{int(time.time())}.jpg"
        dest_path = os.path.join(settings.EVIDENCE_DIR, filename)

        success = cv2.imwrite(dest_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        if not success:
            logger.error(f"Failed to write snapshot to {dest_path}")
            return None

        sha256 = compute_sha256_hash(dest_path)
        file_size = os.path.getsize(dest_path)
        logger.info(f"Forensic snapshot sealed: {filename} (SHA-256: {sha256[:12]}...)")
        return (dest_path, sha256, file_size)

    def save_alert_clip(self, event_id: str, duration_sec: int = 8) -> Optional[Tuple[str, str, int]]:
        """
        Extracts 5-10 second incident clip exclusively from the rolling in-memory buffer.
        Never copies the whole source video. Computes SHA-256 integrity hash.
        """
        if not check_evidence_quota():
            logger.error("Refusing to save alert clip: evidence storage quota exceeded.")
            return None

        if len(self.rolling_frame_buffer) < 2:
            return None

        filename = f"clip_{self.camera_id}_{event_id}_{int(time.time())}.mp4"
        dest_path = os.path.join(settings.EVIDENCE_DIR, filename)

        frames_to_write = list(self.rolling_frame_buffer)
        h, w = frames_to_write[0][1].shape[:2]

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(dest_path, fourcc, self.target_fps, (w, h))

        for _, f, _ in frames_to_write:
            out.write(f)
        out.release()

        sha256 = compute_sha256_hash(dest_path)
        file_size = os.path.getsize(dest_path)
        logger.info(f"Alert clip preserved: {filename} ({file_size / 1024:.1f} KB, SHA-256: {sha256[:12]}...)")
        return (dest_path, sha256, file_size)

    def stop(self):
        self.is_running = False
        if self.cap:
            self.cap.release()
            self.cap = None
        self.rolling_frame_buffer.clear()
        logger.info(f"Stream stopped and released for {self.camera_id}")
