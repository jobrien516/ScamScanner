import os
from dotenv import load_dotenv

from pydantic import BaseModel

load_dotenv(".env.local")


class Settings(BaseModel):
    GEMINI_KEY: str | None = os.getenv("GEMINI_API_KEY")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")


def get_settings() -> Settings:
    return Settings()
