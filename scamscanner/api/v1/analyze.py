import uuid
from fastapi import (
    APIRouter,
    HTTPException,
    BackgroundTasks,
)

from models.schemas import UrlRequest, HtmlRequest, SecretsRequest, CodeAuditRequest
from services.scanners import CodeScanner, ScamScanner, SecretsScanner
from services.websocket_manager import wsman

analyze_router = APIRouter()


async def run_scam_analysis_task(job_id: str, **kwargs):
    """Wrapper to run scam analysis in the scanner's context."""
    async with ScamScanner(job_id=job_id, wsman=wsman) as scanner:
        await scanner.run(**kwargs)


async def run_code_audit_task(job_id: str, **kwargs):
    """Wrapper to run code audit in the scanner's context."""
    async with CodeScanner(job_id=job_id, wsman=wsman) as scanner:
        await scanner.run(**kwargs)


@analyze_router.post("/analyze")
async def analyze_url(request: UrlRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    background_tasks.add_task(
        run_scam_analysis_task,
        job_id=job_id,
        url=request.url,
        scan_depth=str(request.scan_depth),
        use_domain_analyzer=request.use_domain_analyzer,
    )
    return {"job_id": job_id}


@analyze_router.post("/analyze-html")
async def analyze_html(request: HtmlRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    url_placeholder = f"manual_analysis_{job_id}"
    background_tasks.add_task(
        run_scam_analysis_task,
        job_id=job_id,
        url=url_placeholder,
        content=request.html,
    )
    return {"job_id": job_id}


@analyze_router.post("/analyze-secrets")
async def analyze_secrets(request: SecretsRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    scanner = SecretsScanner(job_id=job_id, wsman=wsman)
    background_tasks.add_task(
        scanner.run_analysis, content=request.content, url=request.url
    )
    return {"job_id": job_id}


@analyze_router.post("/analyze-code")
async def analyze_code(request: CodeAuditRequest, background_tasks: BackgroundTasks):
    if not request.url and not request.code:
        raise HTTPException(
            status_code=400, detail="Either 'url' or 'code' must be provided."
        )
    job_id = str(uuid.uuid4())
    background_tasks.add_task(
        run_code_audit_task,
        job_id=job_id,
        url=request.url,
        code=request.code,
    )
    return {"job_id": job_id}
