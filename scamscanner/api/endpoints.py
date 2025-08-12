import uuid
from typing import List
from fastapi import (
    APIRouter,
    HTTPException,
    BackgroundTasks,
    WebSocket,
    WebSocketDisconnect,
)
from loguru import logger
from sqlmodel import select, delete
from sqlalchemy import desc

from ..models.schemas import UrlRequest, HtmlRequest, AnalysisResult
from ..services.db import get_db_session
from ..services.workflows import run_analysis
from ..services.websocket_manager import wsman
from ..models.schemas import Settings

router = APIRouter()
# aw = AnalysisWorkflow(wsman)

@router.get("/history", response_model=List[AnalysisResult])
async def get_analysis_history():
    """Retrieves all analysis results from the database, ordered by most recent."""
    try:
        async with get_db_session() as db:
            statement = select(AnalysisResult).order_by(
                desc(AnalysisResult.last_analyzed_at)  # type: ignore
            )
            results = await db.exec(statement)
            return results.all()
    except Exception as e:
        logger.error(f"Failed to fetch analysis history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analysis history.")

@router.delete("/history")
async def delete_analysis_history():
    """Deletes all analysis results from the database."""
    try:
        async with get_db_session() as db:
            statement = delete(AnalysisResult)
            await db.exec(statement) # type: ignore
            await db.commit()
            return {"message": "Analysis history successfully cleared."}
    except Exception as e:
        logger.error(f"Failed to delete analysis history: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete analysis history.")


@router.post("/analyze")
async def analyze_url(request: UrlRequest, background_tasks: BackgroundTasks):
    """
    Accepts a URL for analysis, starts a background task, and returns a job ID.
    """
    job_id = str(uuid.uuid4())
    background_tasks.add_task(
        run_analysis,
        request.url,
        job_id,
        wsman,
        scan_depth=str(request.scan_depth),
        use_secrets_scanner=True if request.use_secrets_scanner is None else request.use_secrets_scanner,
        use_domain_analyzer=True if request.use_domain_analyzer is None else request.use_domain_analyzer,
    )
    return {"job_id": job_id}


@router.post("/analyze-html")
async def analyze_html(request: HtmlRequest, background_tasks: BackgroundTasks):
    """
    Accepts raw HTML content for analysis, starts a background task,
    and returns a job ID.
    """
    job_id = str(uuid.uuid4())
    url_placeholder = f"manual_analysis_{job_id}"

    background_tasks.add_task(
        run_analysis,
        url=url_placeholder,
        job_id=job_id,
        wsman=wsman,
        content=request.html,
    )
    return {"job_id": job_id}


@router.websocket("/ws/{job_id}")
async def get_websocket(websocket: WebSocket, job_id: str):
    await wsman.connect(job_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        wsman.disconnect(job_id)
        logger.info(f"WebSocket disconnected for job {job_id}")


@router.get("/settings", response_model=Settings)
async def get_settings():
    """Retrieves the current application settings from the database."""
    async with get_db_session() as db:
        settings = await db.get(Settings, 1)
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found.")
        return settings

@router.put("/settings", response_model=Settings)
async def update_settings(new_settings: Settings):
    """Updates the application settings in the database."""
    async with get_db_session() as db:
        settings = await db.get(Settings, 1)
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found.")
        
        settings.gemini_api_key = new_settings.gemini_api_key
        settings.max_output_tokens = new_settings.max_output_tokens
        settings.default_use_secrets_scanner = new_settings.default_use_secrets_scanner
        settings.default_use_domain_analyzer = new_settings.default_use_domain_analyzer
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        return settings