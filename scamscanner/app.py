from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from .services.db import create_db_and_tables
from .api.endpoints import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    On startup, it initializes the database.
    """
    logger.info("Application starting up...")
    await create_db_and_tables()
    yield
    logger.info("Application shutting down...")


def create_app():
    app = FastAPI(
        title="ScamScanner API",
        description="API for scamscan",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)
    return app


app = create_app()
