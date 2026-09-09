from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.core.ws import ws_manager

router = APIRouter()


@router.websocket("/alerts")
async def websocket_alerts(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Client can ping/send heartbeat or subscription filter
            data = await websocket.receive_text()
            # Send immediate acknowledgement / pong
            await websocket.send_json({"type": "HEARTBEAT_ACK", "status": "active"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
