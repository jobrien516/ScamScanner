from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)
from loguru import logger
from services.websocket_manager import wsman

websocket_router = APIRouter()


@websocket_router.websocket("/ws/{job_id}")
async def get_websocket(websocket: WebSocket, job_id: str):
    await wsman.connect(job_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        wsman.disconnect(job_id)
        logger.info(f"WebSocket disconnected for job {job_id}")
