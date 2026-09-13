import asyncio
from typing import Optional
from app.core.database import AsyncSessionLocal
from app.ai.pipeline import process_frame
from app.core.logging import logger

frame_queue = asyncio.Queue(maxsize=100)

async def frame_processing_worker():
    """Worker loop consuming captured camera frames from the shared queue."""
    logger.info("Frame processing queue worker started.")
    while True:
        try:
            item = await frame_queue.get()
            frame = item['frame']
            camera_id = item['camera_id']
            camera_identifier = item.get('camera_identifier', 'CAM')
            timestamp = item['timestamp']

            async with AsyncSessionLocal() as db:
                await process_frame(
                    frame=frame,
                    camera_id=camera_id,
                    camera_identifier=camera_identifier,
                    timestamp=timestamp,
                    db=db
                )
            frame_queue.task_done()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in frame processing worker: {e}")
            await asyncio.sleep(0.1)
