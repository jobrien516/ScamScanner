import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from scamscanner.app import create_app


@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c


def test_analyze_url(client):
    """
    Tests that the analyze_url endpoint returns a 202 Accepted response with a
    job_id when the request is valid.
    """
    with patch(
        "scamscanner.api.v1.analyze.run_analysis_task"
    ) as mock_run_analysis_task:
        response = client.post(
            "/analyze",
            json={
                "url": "http://example.com",
                "scan_depth": "deep",
                "use_domain_analyzer": True,
            },
        )
        assert response.status_code == 200
        assert "job_id" in response.json()
        mock_run_analysis_task.assert_called_once()


def test_analyze_html(client):
    """
    Tests that the analyze_html endpoint returns a 202 Accepted response with a
    job_id when the request is valid.
    """
    with patch(
        "scamscanner.api.v1.analyze.run_analysis_task"
    ) as mock_run_analysis_task:
        response = client.post("/analyze-html", json={"html": "<html></html>"})
        assert response.status_code == 200
        assert "job_id" in response.json()
        mock_run_analysis_task.assert_called_once()


def test_analyze_code(client):
    """
    Tests that the analyze_code endpoint returns a 202 Accepted response with a
    job_id when the request is valid.
    """
    with patch(
        "scamscanner.api.v1.analyze.run_code_audit_task"
    ) as mock_run_code_audit_task:
        response = client.post("/analyze-code", json={"code": "print('hello')"})
        assert response.status_code == 200
        assert "job_id" in response.json()
        mock_run_code_audit_task.assert_called_once()
