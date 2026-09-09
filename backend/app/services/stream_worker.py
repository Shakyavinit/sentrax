import threading
import time
import logging
from typing import Dict, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.core.database import SessionLocal
from backend.app.core.config import settings
from backend.app.core.storage import get_directory_size_mb
from backend.app.models.video_source import VideoSource, VideoSourceStatus, VideoSourceType
from backend.app.models.audit import AuditLog
from ai.ingestion.stream_reader import VideoStreamReader, StreamSourceType

logger = logging.getLogger(__name__)


class StreamWorkerManager:
    """
    Supervisor for active streaming video ingestion threads.
    Streams incremental frames from HTTP MP4 URLs, RTSP, or local files.
    """
    def __init__(self):
        self._active_readers: Dict[int, VideoStreamReader] = {}
        self._threads: Dict[int, threading.Thread] = {}

    def is_running(self, source_id: int) -> bool:
        return source_id in self._active_readers and self._active_readers[source_id].is_running

    def start_source(self, source_id: int, db: Session) -> bool:
        if self.is_running(source_id):
            logger.warning(f"Video source {source_id} is already streaming.")
            return True

        source = db.query(VideoSource).filter(VideoSource.id == source_id).first()
        if not source:
            raise ValueError(f"Video source {source_id} not found")

        reader = VideoStreamReader(
            source_url_or_path=source.url,
            source_type=StreamSourceType[source.source_type.value],
            camera_id=source.camera_id,
            target_fps=source.target_fps or 5.0,
            buffer_duration_sec=settings.ALERT_CLIP_DURATION_SEC
        )

        source.status = VideoSourceStatus.RUNNING
        source.last_started_at = datetime.now(timezone.utc)
        source.last_error = None
        db.commit()

        self._active_readers[source_id] = reader

        thread = threading.Thread(
            target=self._run_stream_loop,
            args=(source_id,),
            daemon=True
        )
        self._threads[source_id] = thread
        thread.start()
        logger.info(f"Spawned streaming ingestion thread for source {source_id} ({source.name})")
        return True

    def stop_source(self, source_id: int, db: Session) -> bool:
        reader = self._active_readers.get(source_id)
        if reader:
            reader.stop()
            self._active_readers.pop(source_id, None)

        thread = self._threads.pop(source_id, None)

        source = db.query(VideoSource).filter(VideoSource.id == source_id).first()
        if source:
            source.status = VideoSourceStatus.STOPPED
            source.last_stopped_at = datetime.now(timezone.utc)
            db.commit()

        logger.info(f"Stopped stream worker for source {source_id}")
        return True

    def _run_stream_loop(self, source_id: int):
        reader = self._active_readers.get(source_id)
        if not reader:
            return

        db = SessionLocal()
        try:
            start_time = time.time()
            for frame_idx, frame, timestamp in reader.read_sampled_frames():
                if not reader.is_running:
                    break

                # Update telemetry in DB every 10 sampled frames
                if frame_idx % 10 == 0:
                    elapsed = max(0.1, time.time() - start_time)
                    current_fps = round(frame_idx / elapsed, 1)

                    db.query(VideoSource).filter(VideoSource.id == source_id).update({
                        VideoSource.frames_processed: frame_idx,
                        VideoSource.current_fps: current_fps
                    })
                    db.commit()

            # Stream finished or EOF
            db.query(VideoSource).filter(VideoSource.id == source_id).update({
                VideoSource.status: VideoSourceStatus.COMPLETED,
                VideoSource.last_stopped_at: datetime.now(timezone.utc)
            })
            db.commit()
        except Exception as e:
            logger.exception(f"Error during streaming execution for source {source_id}: {e}")
            db.query(VideoSource).filter(VideoSource.id == source_id).update({
                VideoSource.status: VideoSourceStatus.ERROR,
                VideoSource.last_error: str(e),
                VideoSource.last_stopped_at: datetime.now(timezone.utc)
            })
            db.commit()
        finally:
            self._active_readers.pop(source_id, None)
            self._threads.pop(source_id, None)
            db.close()

    def get_status(self, source_id: int, db: Session) -> dict:
        source = db.query(VideoSource).filter(VideoSource.id == source_id).first()
        if not source:
            raise ValueError(f"Video source {source_id} not found")

        reader = self._active_readers.get(source_id)
        is_streaming = reader is not None and reader.is_running
        buffer_cached = len(reader.rolling_frame_buffer) if reader else 0

        temp_mb = get_directory_size_mb(settings.TEMP_DIR)
        evid_mb = get_directory_size_mb(settings.EVIDENCE_DIR)

        return {
            "id": source.id,
            "name": source.name,
            "camera_id": source.camera_id,
            "status": source.status,
            "source_type": source.source_type,
            "target_fps": source.target_fps,
            "current_fps": source.current_fps or 0.0,
            "frames_processed": source.frames_processed,
            "last_error": source.last_error,
            "buffer_frames_cached": buffer_cached,
            "temp_storage_mb": round(temp_mb, 2),
            "evidence_storage_mb": round(evid_mb, 2),
            "is_streaming": is_streaming
        }


stream_worker_manager = StreamWorkerManager()
