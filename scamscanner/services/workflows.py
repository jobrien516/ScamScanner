import json
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from loguru import logger
from fastapi import HTTPException

from .website_fetcher import WebsiteFetcher
from .analyzer import WebsiteAnalyzer
from ..models.schemas import AnalysisResult, Site, SubPage, RiskLevel, AnalysisFinding

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

async def main_workflow(url: str, db: AsyncSession, content: str | None = None) -> AnalysisResult:
    """
    Performs the full analysis workflow by parsing the AI response and passing
    the resulting dictionary to the database saving function.
    """
    analyzer = WebsiteAnalyzer()
    aggregated_content = ""

    if not content:
        statement = select(Site).options(selectinload(Site.sub_pages)).where(Site.url == url)  # type: ignore
        result = await db.exec(statement)
        site = result.first()

        if not site or not site.sub_pages:
            fetcher = WebsiteFetcher(url)
            await fetcher.download_site(session=db)
            
            result = await db.exec(statement)
            site = result.first()

        if not site:
            raise HTTPException(status_code=500, detail=f"Could not create or find site entry for {url}.")

        aggregated_content = " ".join([sub_page.content for sub_page in site.sub_pages])
    else:
        aggregated_content = content

    statement = select(Site).where(Site.url == url)
    result = await db.exec(statement)
    site = result.first()

    if not site:
        site = Site(url=url)
        db.add(site)
        await db.commit()
        await db.refresh(site)

    # Perform both analyses
    general_analysis_str = await analyzer.analyze_content(aggregated_content)
    secret_analysis_str = await analyzer.analyze_for_secrets(aggregated_content)

    try:
        general_analysis = json.loads(general_analysis_str.strip().removeprefix('```json').removesuffix('```'))
        secret_analysis = json.loads(secret_analysis_str.strip().removeprefix('```json').removesuffix('```'))

        # Merge the findings
        general_analysis["detailedAnalysis"].extend(secret_analysis.get("detailedAnalysis", []))

        # Recalculate overall risk and score if secrets are found
        if secret_analysis.get("detailedAnalysis"):
            general_analysis["summary"] += " Additionally, exposed secrets were found."
            # You could add more sophisticated logic here to adjust the risk score
            general_analysis["riskScore"] = max(general_analysis["riskScore"], 90)
            general_analysis["overallRisk"] = "Very High"


    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON response from AI for {url}.")
        raise HTTPException(status_code=500, detail="AI returned an invalid response.")

    new_analysis = await _save_analysis_to_db(db=db, site=site, analysis_data=general_analysis)
    return new_analysis