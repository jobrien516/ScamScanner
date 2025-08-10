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
from sqlmodel import select
from sqlalchemy import desc

from ..models.schemas import UrlRequest, HtmlRequest, AnalysisResult
from ..services.db import get_db_session
from ..services.workflows import run_analysis
from ..services.websocket_manager import manager

router = APIRouter()


@router.get("/history", response_model=List[AnalysisResult])
async def get_analysis_history():
    """Retrieves all analysis results from the database, ordered by most recent."""
    try:
        async with get_db_session() as db:
            statement = select(AnalysisResult).order_by(
                desc(AnalysisResult.last_analyzed_at)
            )  # type: ignore
            results = await db.exec(statement)
            return results.all()
    except Exception as e:
        logger.error(f"Failed to fetch analysis history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analysis history.")


@router.post("/analyze")
async def analyze_url(request: UrlRequest, background_tasks: BackgroundTasks):
    """
    Accepts a URL for analysis, starts a background task, and returns a job ID.
    """
    job_id = str(uuid.uuid4())
    background_tasks.add_task(
        run_analysis, request.url, job_id, manager, scan_depth=str(request.scan_depth)
    )
    return {"job_id": job_id}


@router.post("/analyze-html")
async def analyze_html(request: HtmlRequest, background_tasks: BackgroundTasks):
    """
    Accepts raw HTML content for analysis, starts a background task,
    and returns a job ID.
    """
    job_id = str(uuid.uuid4())
    # A unique placeholder URL for manual analysis jobs
    url_placeholder = f"manual_analysis_{job_id}"

    background_tasks.add_task(
        run_analysis,
        url=url_placeholder,
        job_id=job_id,
        manager=manager,
        content=request.html,
    )
    return {"job_id": job_id}


@router.websocket("/ws/{job_id}")
async def get_websocket(websocket: WebSocket, job_id: str):
    await manager.connect(job_id, websocket)
    try:
        while True:
            # Keep the connection alive by waiting for a message (or disconnect)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(job_id)
        logger.info(f"WebSocket disconnected for job {job_id}")


# @router.post("/analyze", response_model=AnalysisResult)
# async def analyze_url_with_caching(request: UrlRequest):
#     """
#     Analyzes a URL with a cache-first approach. If a recent analysis
#     exists, it's returned; otherwise, a new analysis is performed.
#     """
#     try:
#         async with get_db_session() as db:
#             one_day_ago = datetime.now() - timedelta(days=1)

#             statement = select(AnalysisResult).where(
#                 AnalysisResult.site_url == request.url,
#                 AnalysisResult.last_analyzed_at >= one_day_ago,
#             )
#             result = await db.exec(statement)
#             cached_result = result.first()

#             if cached_result:
#                 logger.info(f"Cache HIT for URL: {request.url}")
#                 return cached_result

#             logger.info(f"Cache MISS for URL: {request.url}. Performing live analysis.")

#             new_analysis_data = await main_workflow(url=request.url, db=db)
#             return new_analysis_data

#     except Exception as e:
#         logger.error(f"Failed to process analysis for {request.url}: {e}")
#         raise HTTPException(
#             status_code=500, detail="An internal error occurred during analysis."
#         )


# @router.post("/analyze-html", response_model=AnalysisResult)
# async def analyze_html_endpoint(request: HtmlRequest):
#     """Analyzes raw HTML content without a specific URL."""
#     try:
#         async with get_db_session() as db:
#             analysis_data = await main_workflow(
#                 url="manual_html_analysis", content=request.html, db=db
#             )
#             return analysis_data
#     except Exception as e:
#         logger.error(f"Failed to analyze HTML content: {e}")
#         raise HTTPException(status_code=500, detail="Failed to analyze HTML content.")
