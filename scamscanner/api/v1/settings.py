from fastapi import (
    APIRouter,
    HTTPException,
)
from sqlmodel import select

from models.schemas import Settings
from services.db import get_db_session

settings_router = APIRouter()


@settings_router.get("/settings", response_model=Settings)
async def get_settings():
    """Retrieves the current application settings from the database."""
    async with get_db_session() as db:
        settings = await db.get(Settings, 1)
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found.")
        return settings


@settings_router.put("/settings", response_model=Settings)
async def update_settings(new_settings: Settings):
    """Updates the application settings in the database."""
    async with get_db_session() as db:
        settings = await db.get(Settings, 1)
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found.")

        settings.gemini_api_key = new_settings.gemini_api_key
        settings.max_output_tokens = new_settings.max_output_tokens
        settings.default_use_domain_analyzer = new_settings.default_use_domain_analyzer
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        return settings
