from importlib import reload
from scamscanner import config


def test_get_settings(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_key")
    reload(config)
    settings = config.get_settings()
    assert settings.GEMINI_KEY == "test_key"
