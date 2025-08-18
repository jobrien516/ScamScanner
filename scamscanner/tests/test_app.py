import pytest
from fastapi.testclient import TestClient
from scamscanner.app import create_app


@pytest.fixture
def client():
    app = create_app()
    with TestClient(app) as c:
        yield c
