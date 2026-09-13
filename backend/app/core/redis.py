import json
from typing import Optional, Any
import redis.asyncio as aioredis
from app.core.config import settings
from app.core.logging import logger

redis_client: Optional[aioredis.Redis] = None

async def init_redis() -> aioredis.Redis:
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        await redis_client.ping()
        logger.info("Connected to Redis successfully.")
        return redis_client
    except Exception as e:
        logger.warning(f"Redis connection failed ({e}). Proceeding in degraded mode.")
        return None

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Closed Redis connection.")

async def get_redis() -> Optional[aioredis.Redis]:
    global redis_client
    if redis_client is None:
        return await init_redis()
    return redis_client

async def publish_event(channel: str, event_type: str, payload: Any):
    client = await get_redis()
    if client:
        try:
            message = json.dumps({"type": event_type, "payload": payload})
            await client.publish(channel, message)
        except Exception as e:
            logger.error(f"Failed to publish event to {channel}: {e}")
