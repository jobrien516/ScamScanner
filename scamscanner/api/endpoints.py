from fastapi import APIRouter
from api.v1.analyze import analyze_router
from api.v1.history import history_router
from api.v1.settings import settings_router
from api.v1.ws import websocket_router
from api.v1.root import root_router

router = APIRouter()

router.include_router(analyze_router)
router.include_router(history_router)
router.include_router(settings_router)
router.include_router(websocket_router)
router.include_router(root_router)
