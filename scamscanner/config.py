import os
from dotenv import load_dotenv
from pathlib import Path

from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(f"{ROOT_DIR}/.env.local")


class Settings(BaseModel):
    GEMINI_KEY: str | None = os.getenv("GEMINI_API_KEY")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")
    GEMINI_MODEL: str = "gemini-2.5-pro"


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
