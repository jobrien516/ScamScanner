import uuid
from fastapi import (
    APIRouter,
    BackgroundTasks,
)

from ...models.schemas import UrlRequest, HtmlRequest
from ...services.workflows import run_analysis
from ...services.websocket_manager import wsman

anal_router = APIRouter()

@anal_router.post("/analyze")
async def analyze_url(request: UrlRequest, background_tasks: BackgroundTasks):
    """
    Accepts a URL for analysis, starts a background task, and returns a job ID.
    """
    job_id = str(uuid.uuid4())
    background_tasks.add_task(
        run_analysis, request.url, job_id, wsman, scan_depth=str(request.scan_depth)
    )
    return {"job_id": job_id}

@anal_router.post("/analyze-html")
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