import os
import json
from sqlmodel import SQLModel, main, select
from sqlalchemy.ext.asyncio import create_async_engine
from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from loguru import logger
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from ..models.schemas import Settings 

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///scamscan.db")


class PydanticEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, main.SQLModel):
            return obj.model_dump()
        return json.JSONEncoder.default(self, obj)


engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    json_serializer=lambda obj: json.dumps(obj, cls=PydanticEncoder),
)


async def init_db():
    """
    Initializes the database and creates tables from SQLModel metadata
    only if they do not already exist.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Ensure a default settings row exists
    async with get_db_session() as session:
        statement = select(Settings).where(Settings.id == 1)
        result = await session.exec(statement)
        settings = result.first()
        if not settings:
            session.add(Settings(id=1))
            await session.commit()
            logger.info("Default settings row created.")
            
    logger.info("Database tables verified/created successfully.")

@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an asynchronous database session.
    """
    async with AsyncSession(engine) as session:
        yield session
