import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from .services.db import init_db
from .api.endpoints import router
from .services.websocket_manager import WebsocketConnectionManager


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """
#     Handles application startup and shutdown events.
#     On startup, it initializes the database.
#     """
#     logger.info("Application starting up...")
#     await init_db()
#     yield
#     logger.info("Application shutting down...")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starting up...")
    await init_db()

    logger.info("Initializing WebsocketConnectionManager on app.state")
    app.state.wsman = WebsocketConnectionManager()

    try:
        yield
    finally:
        wsman = getattr(app.state, "wsman", None)
        if wsman is None:
            logger.info("No WebsocketConnectionManager found on app.state; skipping cleanup.")
        else:
            cleanup_methods = [
                "close_all",
                "disconnect_all",
                "shutdown",
                "shutdown_async",
                "stop",
                "close",
                "aclose",
            ]
            cleaned = False
            for name in cleanup_methods:
                maybe = getattr(wsman, name, None)
                if not maybe:
                    continue
                try:
                    logger.info(f"Attempting websocket manager cleanup via {name}()")
                    result = maybe()
                    if asyncio.iscoroutine(result):
                        await result
                    logger.info(f"Websocket manager cleanup via {name}() completed")
                    cleaned = True
                    break
                except Exception:
                    logger.exception(f"Error while calling wsman. {name}()")
            if not cleaned:
                logger.info("No cleanup method succeeded for WebsocketConnectionManager; continuing shutdown.")

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
