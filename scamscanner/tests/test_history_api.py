import pytest
from fastapi.testclient import TestClient
from scamscanner.app import create_app
from unittest.mock import patch, AsyncMock, MagicMock


@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c


@pytest.mark.asyncio
async def test_get_analysis_history(client):
    with patch("scamscanner.api.v1.history.get_db_session") as mock_get_db_session:
        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.all.return_value = []
        mock_session.exec.return_value = mock_result
        mock_get_db_session.return_value.__aenter__.return_value = mock_session

        response = client.get("/history")
        assert response.status_code == 200
        assert response.json() == []


@pytest.mark.asyncio
async def test_delete_analysis_history(client):
    with patch("scamscanner.api.v1.history.get_db_session") as mock_get_db_session:
        mock_session = AsyncMock()
        mock_get_db_session.return_value.__aenter__.return_value = mock_session

        response = client.delete("/history")
        assert response.status_code == 200
        assert response.json() == {"message": "Analysis history successfully cleared."}
