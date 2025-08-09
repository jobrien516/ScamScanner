from fastapi import APIRouter, HTTPException, Depends
from loguru import logger
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timedelta
from sqlmodel import select

from models.schemas import UrlRequest, HtmlRequest, AnalysisResult
from services.db import get_db_session
from services.workflows import main_workflow

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_url_with_caching(
    request: UrlRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Analyzes a URL with a cache-first approach. If a recent analysis
    exists, it's returned; otherwise, a new analysis is performed.
    """
    try:
        one_day_ago = datetime.now() - timedelta(days=1)
        
        statement = select(AnalysisResult).where(
            AnalysisResult.site_url == request.url,
            AnalysisResult.last_analyzed_at >= one_day_ago
        )
        result = await db.exec(statement)
        cached_result = result.first()

        if cached_result:
            logger.info(f"Cache HIT for URL: {request.url}")
            return cached_result

        logger.info(f"Cache MISS for URL: {request.url}. Performing live analysis.")
        
        new_analysis_data = await main_workflow(url=request.url, db=db)
        return new_analysis_data

    except Exception as e:
        logger.error(f"Failed to process analysis for {request.url}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during analysis.")

@router.post("/analyze-html", response_model=AnalysisResult)
async def analyze_html_endpoint(
    request: HtmlRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """Analyzes raw HTML content without a specific URL."""
    try:
        analysis_data = await main_workflow(
            url="manual_html_analysis", 
            html_content=request.html, 
            db=db
        )        
        return analysis_data
    except Exception as e:
        logger.error(f"Failed to analyze HTML content: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze HTML content.")
