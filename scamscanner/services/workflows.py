import json
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from loguru import logger
from fastapi import HTTPException

from .website_fetcher import WebsiteFetcher
from .analyzer import WebsiteAnalyzer
from ..models.schemas import AnalysisResult, Site


def _calculate_overall_risk(analysis_data: dict) -> dict:
    """Calculates a new risk score and level based on all findings."""
    severity_points = {"Low": 5, "Medium": 10, "High": 25, "Very High": 40}

    total_score = 0
    for finding in analysis_data.get("detailedAnalysis", []):
        total_score += severity_points.get(finding.get("severity"), 0)

    risk_score = min(total_score, 100)

    overall_risk = "Unknown"
    if risk_score > 80:
        overall_risk = "Very High"
    elif risk_score > 55:
        overall_risk = "High"
    elif risk_score > 20:
        overall_risk = "Medium"
    else:
        overall_risk = "Low"

    analysis_data["riskScore"] = risk_score
    analysis_data["overallRisk"] = overall_risk

    return analysis_data


async def _save_analysis_to_db(
    db: AsyncSession, site: Site, analysis_data: dict
) -> AnalysisResult:
    """Saves a new analysis result linked to a site, ensuring data is normalized."""
    logger.info(f"Saving analysis for {site.url} to the database.")

    if site.id is None:
        raise ValueError(
            "The Site object must be saved and have an ID before analysis can be saved."
        )

    # Recalculate risk based on combined findings before saving
    final_analysis = _calculate_overall_risk(analysis_data)

    new_record = AnalysisResult(
        site_id=site.id,
        site_url=site.url,
        overallRisk=final_analysis.get("overallRisk", "Unknown"),
        riskScore=final_analysis.get("riskScore", 0),
        summary=final_analysis.get("summary", "No summary provided."),
        detailedAnalysis=final_analysis.get("detailedAnalysis", []),
    )

    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    return new_record


async def main_workflow(
    url: str, db: AsyncSession, content: str | None = None
) -> AnalysisResult:
    """
    Performs the full analysis workflow by parsing the AI response and passing
    the resulting dictionary to the database saving function.
    """
    analyzer = WebsiteAnalyzer()
    aggregated_content = ""

    if not content:
        statement = (
            select(Site).options(selectinload(Site.sub_pages)).where(Site.url == url)  # type: ignore
        )
        result = await db.exec(statement)
        site = result.first()

        if not site or not site.sub_pages:
            fetcher = WebsiteFetcher(url)
            await fetcher.download_site(session=db)

            result = await db.exec(statement)
            site = result.first()

        if not site:
            raise HTTPException(
                status_code=500,
                detail=f"Could not create or find site entry for {url}.",
            )

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

    general_analysis_str = await analyzer.analyze_content(aggregated_content)
    secret_analysis_str = await analyzer.analyze_for_secrets(aggregated_content)

    try:
        general_analysis = json.loads(
            general_analysis_str.strip().removeprefix("```json").removesuffix("```")
        )
        secret_analysis = json.loads(
            secret_analysis_str.strip().removeprefix("```json").removesuffix("```")
        )

        general_analysis["detailedAnalysis"].extend(
            secret_analysis.get("detailedAnalysis", [])
        )

    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON response from AI for {url}.")
        raise HTTPException(status_code=500, detail="AI returned an invalid response.")

    new_analysis = await _save_analysis_to_db(
        db=db, site=site, analysis_data=general_analysis
    )
    return new_analysis
