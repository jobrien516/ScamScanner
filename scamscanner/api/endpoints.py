from fastapi import APIRouter
from .v1.analyze import analyze_router
from .v1.history import history_router
from .v1.settings import settings_router
from .v1.ws import websocket_router

router = APIRouter()

router.include_router(analyze_router)
router.include_router(history_router)
router.include_router(settings_router)
router.include_router(websocket_router)
