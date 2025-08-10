from fastapi import WebSocket
from typing import Dict, Any


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[job_id] = websocket

    def disconnect(self, job_id: str):
        if job_id in self.active_connections:
            del self.active_connections[job_id]

    async def send_update(self, message: str, job_id: str):
        if job_id in self.active_connections:
            await self.active_connections[job_id].send_text(message)

    async def send_final_result(self, result: Any, job_id: str):
        if job_id in self.active_connections:
            await self.active_connections[job_id].send_json(result)


manager = ConnectionManager()
