from scamscanner.config import get_settings
from importlib import reload
from scamscanner import config

def test_get_settings(monkeypatch):
    """
    Tests that the get_settings function returns a valid Settings object with the
    correct default values.
    """
    monkeypatch.setenv("GEMINI_API_KEY", "test_key")
    reload(config)
    settings = config.get_settings()
    assert settings.GEMINI_KEY == "test_key"