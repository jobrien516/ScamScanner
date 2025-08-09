import json
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from loguru import logger
from fastapi import HTTPException

from services.website_fetcher import WebsiteFetcher
from services.analyzer import WebsiteAnalyzer
from models.schemas import AnalysisResult, Site, RiskLevel, AnalysisFinding

async def _save_analysis_to_db(db: AsyncSession, site: Site, analysis_data: dict) -> AnalysisResult:
    """Saves a new analysis result linked to a site, ensuring data is normalized."""
    logger.info(f"Saving analysis for {site.url} to the database.")

    if site.id is None:
        raise ValueError("The Site object must be saved and have an ID before analysis can be saved.")

    new_record = AnalysisResult(
        site_id=site.id,
        site_url=site.url,
        overallRisk=analysis_data.get("overallRisk", "Unknown"),
        riskScore=analysis_data.get("riskScore", 0),
        summary=analysis_data.get("summary", "No summary provided."),
        detailedAnalysis=analysis_data.get("detailedAnalysis", [])
    )

    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    return new_record

async def main_workflow(url: str, db: AsyncSession, html_content: str | None = None) -> AnalysisResult:
    """
    Performs the full analysis workflow by parsing the AI response and passing
    the resulting dictionary to the database saving function.
    """
    analyzer = WebsiteAnalyzer()

    if not html_content:
        fetcher = WebsiteFetcher(url)
        html_content = await fetcher.fetch_website_html()

    statement = select(Site).where(Site.url == url)
    result = await db.exec(statement)
    site = result.first()

    if not site:
        site = Site(url=url, html=html_content)
        db.add(site)
        await db.commit()
        await db.refresh(site)

    analysis_result_str = await analyzer.analyze_website_html(html_content)

    try:
        cleaned_str = analysis_result_str.strip().removeprefix('```json').removesuffix('```')
        # Just parse to a dictionary. No further conversion is needed here.
        analysis_dict = json.loads(cleaned_str)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON response from AI for {url}.")
        raise HTTPException(status_code=500, detail="AI returned an invalid response.")

    new_analysis = await _save_analysis_to_db(db=db, site=site, analysis_data=analysis_dict)
    return new_analysis
