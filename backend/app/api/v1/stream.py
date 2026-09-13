import json
import asyncio
from typing import List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.redis import get_redis
from app.core.logging import logger

router = APIRouter(tags=["Streaming"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
        for dc in dead_connections:
            self.active_connections.discard(dc)

manager = ConnectionManager()

@router.websocket("/ws/monitor")
async def websocket_monitor_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    redis = await get_redis()
    pubsub = None
    if redis:
        try:
            pubsub = redis.pubsub()
            await pubsub.subscribe("monitor_channel", "alerts_channel")
        except Exception as e:
            logger.warning(f"Failed to subscribe to Redis for WS: {e}")
            pubsub = None

    async def listen_redis():
        if not pubsub:
            return
        try:
            while True:
                msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if msg and msg["type"] == "message":
                    try:
                        data = json.loads(msg["data"])
                        await websocket.send_json(data)
                    except Exception:
                        pass
                await asyncio.sleep(0.1)
        except Exception:
            pass

    redis_task = asyncio.create_task(listen_redis()) if pubsub else None

    try:
        while True:
            # Receive client heartbeat or messages
            data = await websocket.receive_text()
            try:
                req = json.loads(data)
                if req.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        if redis_task:
            redis_task.cancel()
        if pubsub:
            await pubsub.unsubscribe()
        manager.disconnect(websocket)
