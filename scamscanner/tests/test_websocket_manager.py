import pytest
from unittest.mock import AsyncMock
from scamscanner.services.websocket_manager import WebsocketConnectionManager


@pytest.mark.asyncio
async def test_websocket_manager_connect_disconnect():
    """
    Tests that the WebsocketConnectionManager can connect and disconnect a client.
    """
    manager = WebsocketConnectionManager()
    websocket = AsyncMock()
    job_id = "test_job_1"

    await manager.connect(job_id, websocket)
    assert job_id in manager.active_connections
    assert manager.active_connections[job_id] == websocket

    manager.disconnect(job_id)
    assert job_id not in manager.active_connections


@pytest.mark.asyncio
async def test_websocket_manager_send_update():
    """
    Tests that the WebsocketConnectionManager can send a text update to a client.
    """
    manager = WebsocketConnectionManager()
    websocket = AsyncMock()
    job_id = "test_job_2"

    await manager.connect(job_id, websocket)
    await manager.send_update("Test update", job_id)

    websocket.send_text.assert_called_once_with("Test update")


@pytest.mark.asyncio
async def test_websocket_manager_send_final_result():
    """
    Tests that the WebsocketConnectionManager can send a final JSON result to a client.
    """
    manager = WebsocketConnectionManager()
    websocket = AsyncMock()
    job_id = "test_job_3"
    result_data = {"status": "complete"}

    await manager.connect(job_id, websocket)
    await manager.send_final_result(result_data, job_id)

    websocket.send_json.assert_called_once_with(result_data)
