import json
import asyncio
from urllib.parse import urlparse
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, SQLModel
from sqlalchemy.orm import selectinload
from loguru import logger
from fastapi import HTTPException, BackgroundTasks

from .website_fetcher import WebsiteFetcher
from .analyzer import WebsiteAnalyzer
from .domain_analyzer import DomainAnalyzer
from ..models.schemas import AnalysisResult, Site, SubPage, RiskLevel, AnalysisFinding, DomainInfo
from .websocket_manager import ConnectionManager
from ..services.db import get_db_session

def _calculate_overall_risk(analysis_data: dict) -> dict:
    """Calculates a new risk score and level based on all findings."""
    severity_points = {
        "Low": 1,
        "Medium": 9,
        "High": 24,
        "Very High": 39
    }
    
    total_score = 0
    for finding in analysis_data.get("detailedAnalysis", []):
        total_score += severity_points.get(finding.get("severity"), 0)

    risk_score = min(total_score, 100)
    
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


async def _save_analysis_to_db(db: AsyncSession, site: Site, analysis_data: dict) -> AnalysisResult:
    """Saves a new analysis result linked to a site, ensuring data is normalized."""
    logger.info(f"Saving analysis for {site.url} to the database.")

    if site.id is None:
        raise ValueError("The Site object must be saved and have an ID before analysis can be saved.")

    # Add site-related info to the dictionary BEFORE validation
    analysis_data['site_id'] = site.id
    analysis_data['site_url'] = site.url

    # Recalculate risk based on combined findings
    final_analysis = _calculate_overall_risk(analysis_data)
    
    new_record = AnalysisResult.model_validate(final_analysis)
    
    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    return new_record


async def run_analysis(url: str, job_id: str, manager: ConnectionManager, content: str | None = None):
    """
    The main analysis workflow run as a background task.
    """
    async with get_db_session() as db:
        try:
            analyzer = WebsiteAnalyzer()
            domain_analyzer = DomainAnalyzer()
            aggregated_content = ""
            domain_info = None
            site = None

            if content:
                await manager.send_update("Analyzing provided content...", job_id)
                await asyncio.sleep(0)
                aggregated_content = content
            else:
                fetcher = WebsiteFetcher(url=url, job_id=job_id, manager=manager)
                await fetcher.download_site(session=db)
                
                statement = select(Site).options(selectinload(Site.sub_pages)).where(Site.url == url)  # type: ignore
                result = await db.exec(statement)
                site = result.first()
                if not site:
                    raise Exception(f"Site {url} not found after download process.")

                aggregated_content = " ".join([sub_page.content for sub_page in site.sub_pages])
                
                await manager.send_update("Finding out who owns this jawn...", job_id)
                await asyncio.sleep(0)
                try:
                    domain_info = await asyncio.wait_for(domain_analyzer.get_domain_info(url), timeout=15.0)
                except asyncio.TimeoutError:
                    logger.warning(f"WHOIS lookup for {url} timed out.")
                    await manager.send_update("WHOIS lookup timed out, continuing analysis...", job_id)
                    domain_info = None
            
            if not site:
                site_statement = select(Site).where(Site.url == url)
                res = await db.exec(site_statement)
                site = res.first()
                if not site:
                    site = Site(url=url)
                    db.add(site)
                    await db.commit()
                    await db.refresh(site)

            await manager.send_update("Scanning for exposed secrets big and small...", job_id)
            await asyncio.sleep(0)
            secret_analysis_str = await analyzer.analyze_for_secrets(aggregated_content)

            await manager.send_update("Analyzing for scammy looking stuff...", job_id)
            await asyncio.sleep(0)
            general_analysis_str = await analyzer.analyze_content(aggregated_content)
            
            await manager.send_update("Compiling final report...", job_id)
            await asyncio.sleep(0)

            analysis_data = json.loads(general_analysis_str.strip().removeprefix('```json').removesuffix('```'))
            secret_analysis = json.loads(secret_analysis_str.strip().removeprefix('```json').removesuffix('```'))
            
            analysis_data["detailedAnalysis"].extend(secret_analysis.get("detailedAnalysis", []))
            analysis_data["domainInfo"] = domain_info

            if domain_info and domain_info.get("domain_age_days") is not None:
                domain_age = domain_info['domain_age_days']
                severity = "Low"
                if domain_age < 30:
                    severity = "High"
                elif domain_age < 180:
                    severity = "Medium"

                analysis_data["detailedAnalysis"].insert(0, {
                    "category": "Domain Intelligence",
                    "severity": severity,
                    "description": f"Domain registered on {domain_info['creation_date']}. Age: {domain_age} days. Registrar: {domain_info.get('registrar', 'N/A')}.",
                })

            final_result_model = await _save_analysis_to_db(db=db, site=site, analysis_data=analysis_data)
            
            await manager.send_final_result(json.loads(final_result_model.model_dump_json()), job_id)

        except Exception as e:
            logger.error(f"Error in analysis task for job {job_id}: {e}")
            await manager.send_update(f"An error occurred during analysis: {e}", job_id)
        finally:
            manager.disconnect(job_id)
            logger.info(f"Analysis task for job {job_id} finished and disconnected.")