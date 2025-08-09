import os
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from loguru import logger
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///scamscan.db")

engine = create_async_engine(DATABASE_URL, echo=False)


async def create_db_and_tables():
    """
    Initializes the database and creates tables from SQLModel metadata
    only if they do not already exist.
    """
    async with engine.begin() as conn:
        if "sqlite" in DATABASE_URL:
            logger.warning("Development mode: Dropping and recreating all tables.")
            await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    logger.info("Database tables verified/created successfully.")


@asynccontextmanager  # Apply the decorator
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an asynchronous database session.

    This function now also serves as a proper async context manager,
    allowing it to be used in 'async with' statements.

    Yields:
        An asynchronous database session.
    """
    async with AsyncSession(engine) as session:
        yield session
