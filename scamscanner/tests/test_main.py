import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from scamscanner.main import app, WebsiteFetchError

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_website_fetch_exception_handler(client):
    """
    Tests that the WebsiteFetchError exception handler returns a 400 response
    with the correct error message.
    """
    with patch('scamscanner.app.create_app', side_effect=WebsiteFetchError("Test error")):
        # This is a bit of a trick to trigger the exception handler from within the app context
        # A more direct approach would require refactoring the app setup slightly.
        
        @app.get("/test-error")
        def _():
            raise WebsiteFetchError("Could not access the website.")

        with TestClient(app) as c:
            response = c.get("/test-error")
            assert response.status_code == 400
            assert response.json() == {"detail": "Could not access the website. Reason: Could not access the website."}