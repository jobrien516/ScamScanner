import uuid
from fastapi import (
    APIRouter,
    HTTPException,
    BackgroundTasks,
)

from ...models.schemas import UrlRequest, HtmlRequest, SecretsRequest
from ...services.workflows import run_analysis
from ...services.secrets_scanner import SecretsScanner
from ...services.websocket_manager import wsman

analyze_router = APIRouter()

@analyze_router.post("/analyze")
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
        use_domain_analyzer=True if request.use_domain_analyzer is None else request.use_domain_analyzer,
    )
    return {"job_id": job_id}

@analyze_router.post("/analyze-html")
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

@analyze_router.post("/analyze-secrets")
async def analyze_secrets(request: SecretsRequest, background_tasks: BackgroundTasks):
    """
    Accepts a URL or raw content for secrets analysis, starts a background task,
    and returns a job ID.
    """
    job_id = str(uuid.uuid4())
    scanner = SecretsScanner(job_id=job_id, wsman=wsman)
    background_tasks.add_task(
        scanner.run_analysis,
        content=request.content,
        url=request.url
    )
    return {"job_id": job_id}
