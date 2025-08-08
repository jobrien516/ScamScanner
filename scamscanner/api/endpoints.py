from fastapi import APIRouter, HTTPException, Depends, Response
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from models.url import UrlRequest
from models.schemas import AnalysisResultDB
from services.db import get_db_session
from services.workflows import main_workflow
from sqlalchemy.future import select
from services.website_fetcher import WebsiteFetcher
from services.analyzer import WebsiteAnalyzer

router = APIRouter()

@router.post("/analyze")
async def analyze_url_with_caching(
    request: UrlRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """Analyzes a URL with a cache-first approach using an async session."""
    try:
        one_day_ago = datetime.now() - timedelta(days=1)
        
        # Asynchronously query the database
        result = await db.execute(
            select(AnalysisResultDB).filter(
                AnalysisResultDB.site_url == request.url,
                AnalysisResultDB.last_analyzed_at >= one_day_ago
            )
        )
        cached_result = result.scalar_one_or_none()

        if cached_result:
            logger.info(f"Cache HIT for URL: {request.url}")
            return cached_result

        logger.info(f"Cache MISS for URL: {request.url}. Performing live analysis.")
        new_analysis_data = await main_workflow(url=request.url, db=db)
        return new_analysis_data

    except Exception as e:
        logger.error(f"Failed to process analysis for {request.url}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/{site_url}")
async def get_analysis(
    site_url: str,
    # Use the dependency directly in your endpoint
    db: AsyncSession = Depends(get_db_session) 
):
    """Example of fetching an analysis result."""
    query = select(AnalysisResultDB).filter(AnalysisResultDB.site_url == site_url)
    result = await db.execute(query)
    analysis = result.scalar_one_or_none()
    
    return analysis

@router.post("/fetch-html")
async def fetch_html_endpoint(request: UrlRequest):
    """Takes a URL and returns the raw HTML content."""
    try:
        fetcher = WebsiteFetcher(request.url)
        html_content = await fetcher.fetch_website_html()
        # Return the content as plain text
        return Response(content=html_content, media_type="text/html")
    except Exception as e:
        logger.error(f"Failed to fetch HTML for {request.url}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch HTML: {e}")

@router.post("/download-site")
async def download_site_endpoint(request: UrlRequest):
    fetcher: WebsiteFetcher = WebsiteFetcher(request.url)
    try:
        await fetcher.download_site()
        return {"message": "Download complete"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# @router.post("/analyze-website")
# async def analyze_website(request: UrlRequest):
#     try:
#         response = await main_workflow(url=request.url)
#         return response
#     except HTTPException as e:
#         raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze-html")
async def analyze_html_endpoint(request: dict):
    """Takes raw HTML and returns a JSON analysis."""
    try:
        html = request.get("html")
        if not html:
            raise HTTPException(status_code=400, detail="HTML content is missing")
        
        analyzer = WebsiteAnalyzer()
        analysis_result = await analyzer.analyze_website_html(html)
        return analysis_result
    except Exception as e:
        logger.error(f"Failed to analyze HTML content: {e}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {e}")