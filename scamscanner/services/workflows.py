import json
import asyncio
import git
import tempfile
import os
from pathlib import Path
from fastapi.concurrency import run_in_threadpool
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from loguru import logger

from .website_fetcher import WebsiteFetcher
from .analyzer import WebsiteAnalyzer
from .domain_analyzer import DomainAnalyzer
from ..models.schemas import AnalysisResult, Site, AuditResult
from .websocket_manager import WebsocketConnectionManager
from ..services.db import get_db_session
from ..models.constants import CODE_AUDITOR_PROMPT, CODE_AUDITOR_SCHEMA


class AnalysisManager:
    """Manages the analysis and code audit workflows."""

    def __init__(self, job_id: str, wsman: WebsocketConnectionManager):
        self.job_id = job_id
        self.wsman = wsman
        self.db_session_context = get_db_session()
        self.db: AsyncSession | None = None
        self.analyzer = WebsiteAnalyzer()

    async def __aenter__(self):
        self.db = await self.db_session_context.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.db_session_context.__aexit__(exc_type, exc_val, exc_tb)

    def _calculate_overall_risk(self, data: dict) -> dict:
        """Calculates a new risk score and level based on all findings."""
        severity = {"Low": 3, "Medium": 11, "High": 19, "Very High": 29}
        x = 0
        for d in data.get("detailedAnalysis", []):
            x += severity.get(d.get("severity"), 0)
        score = min(x, 100)
        if score > 90:
            risk = "Very High"
        elif score > 55:
            risk = "High"
        elif score > 20:
            risk = "Medium"
        else:
            risk = "Low"
        data["riskScore"] = score
        data["overallRisk"] = risk
        return data

    async def _save_analysis_to_db(self, site: Site, analysis_data: dict) -> AnalysisResult:
        """Saves a new analysis result linked to a site, ensuring data is normalized."""
        assert self.db is not None, "Database session not initialized"
        logger.info(f"Saving analysis for {site.url} to the database.")
        if site.id is None:
            raise ValueError("The Site object must be saved and have an ID before analysis can be saved.")
        analysis_data["site_id"] = site.id
        analysis_data["site_url"] = site.url
        final_analysis = self._calculate_overall_risk(analysis_data)
        new_record = AnalysisResult.model_validate(final_analysis)
        self.db.add(new_record)
        await self.db.commit()
        await self.db.refresh(new_record)
        return new_record

    async def _save_audit_to_db(self, site: Site, audit_data: dict) -> AuditResult:
        """Saves a new audit result linked to a site."""
        assert self.db is not None, "Database session not initialized"
        logger.info(f"Saving audit for {site.url} to the database.")
        if site.id is None:
            raise ValueError("The Site object must be saved and have an ID before analysis can be saved.")
        audit_data["site_id"] = site.id
        audit_data["source_identifier"] = site.url
        severity_points = {"Low": -2, "Medium": -5, "High": -10}
        score = 100
        for finding in audit_data.get("detailedAnalysis", []):
            score += severity_points.get(finding.get("severity"), 0)
        audit_data["qualityScore"] = max(0, score)
        if audit_data["qualityScore"] >= 90:
            audit_data["overallGrade"] = "A"
        elif audit_data["qualityScore"] >= 80:
            audit_data["overallGrade"] = "B"
        elif audit_data["qualityScore"] >= 70:
            audit_data["overallGrade"] = "C"
        elif audit_data["qualityScore"] >= 60:
            audit_data["overallGrade"] = "D"
        else:
            audit_data["overallGrade"] = "F"
        new_record = AuditResult.model_validate(audit_data)
        self.db.add(new_record)
        await self.db.commit()
        await self.db.refresh(new_record)
        return new_record

    async def run_analysis(
        self,
        url: str,
        content: str | None = None,
        scan_depth: str = "deep",
        use_secrets_scanner: bool = True,
        use_domain_analyzer: bool = True,
    ):
        """Orchestrates the scam analysis workflow."""
        try:
            aggregated_content, site = await self._get_content_for_analysis(url, content, scan_depth)
            domain_info = None
            if use_domain_analyzer and not content:
                domain_info = await self._get_domain_info(url)
            site = await self._ensure_site_exists(url, site)
            secret_analysis_str = "{}"
            if use_secrets_scanner:
                secret_analysis_str = await self._run_secrets_scan(aggregated_content)
            general_analysis_str = await self._run_general_scan(aggregated_content)
            final_result = await self._process_and_save_analysis(
                site, general_analysis_str, secret_analysis_str, domain_info
            )
            await self.wsman.send_final_result(
                json.loads(final_result.model_dump_json()), self.job_id
            )
        except Exception as e:
            await self._handle_exception(e)
        finally:
            self._disconnect_ws()

    async def _get_content_for_analysis(self, url: str, content: str | None, scan_depth: str) -> tuple[str, Site | None]:
        """Fetches website content based on the provided inputs."""
        assert self.db is not None, "Database session not initialized"
        if content:
            await self.wsman.send_update("Analyzing provided content...", self.job_id)
            return content, None
        fetcher = WebsiteFetcher(url=url, job_id=self.job_id, wsman=self.wsman)
        if scan_depth == "deep":
            await fetcher.download_site(session=self.db)
            statement = select(Site).options(selectinload(Site.sub_pages)).where(Site.url == url) # type: ignore
            site = (await self.db.exec(statement)).first()
            if not site:
                raise Exception(f"Site {url} not found after download.")
            aggregated_content = " ".join([sub_page.content for sub_page in site.sub_pages])
            return aggregated_content, site
        else:
            await self.wsman.send_update(f"Fetching content from {url}...", self.job_id)
            aggregated_content = await fetcher.fetch_url_content(url)
            return aggregated_content, None

    async def _get_domain_info(self, url: str) -> dict | None:
        """Performs a WHOIS lookup for the given URL."""
        await self.wsman.send_update("Performing domain intelligence lookup...", self.job_id)
        domain_analyzer = DomainAnalyzer()
        try:
            return await asyncio.wait_for(domain_analyzer.get_domain_info(url), timeout=15.0)
        except asyncio.TimeoutError:
            logger.warning(f"WHOIS lookup for {url} timed out.")
            await self.wsman.send_update("WHOIS lookup timed out, continuing...", self.job_id)
            return None

    async def _run_secrets_scan(self, content: str) -> str:
        """Runs the secrets scan on the content."""
        assert self.db is not None, "Database session not initialized"
        await self.wsman.send_update("Scanning for exposed secrets...", self.job_id)
        return await self.analyzer.analyze_for_secrets(content, self.db)

    async def _run_general_scan(self, content: str) -> str:
        """Runs the general scam analysis on the content."""
        assert self.db is not None, "Database session not initialized"
        await self.wsman.send_update("Analyzing for malicious patterns...", self.job_id)
        return await self.analyzer.analyze_content(content, self.db)

    async def run_code_audit(self, url: str | None = None, code: str | None = None):
        """Orchestrates the code audit workflow."""
        try:
            aggregated_content, source_identifier = await self._get_content_for_audit(url, code)
            site = await self._ensure_site_exists(source_identifier)
            audit_str = await self._run_ai_audit(aggregated_content)
            final_result = await self._process_and_save_audit(site, str(audit_str))
            await self.wsman.send_final_result(
                json.loads(final_result.model_dump_json()), self.job_id
            )
        except Exception as e:
            await self._handle_exception(e)
        finally:
            self._disconnect_ws()

    async def _get_content_for_audit(self, url: str | None, code: str | None) -> tuple[str, str]:
        """Fetches content for auditing from a URL, Git repo, or raw code."""
        if code:
            return code, f"manual_audit_{self.job_id}"
        if not url:
            raise ValueError("Either URL or code must be provided for audit.")
        if "github.com" in url:
            await self.wsman.send_update(f"Cloning repository from {url}...", self.job_id)
            with tempfile.TemporaryDirectory() as temp_dir:
                await run_in_threadpool(git.Repo.clone_from, url, temp_dir)
                await self.wsman.send_update("Reading files from repository...", self.job_id)
                aggregated_content = ""
                repo_path = Path(temp_dir)
                for root, _, files in os.walk(repo_path):
                    for file in files:
                        try:
                            full_path = Path(root) / file
                            relative_path = full_path.relative_to(repo_path)
                            with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                                content = f.read()
                                aggregated_content += f"\n\n--- FILE: {relative_path} ---\n\n{content}"
                        except Exception as e:
                            logger.warning(f"Could not read file {file}: {e}")
                return aggregated_content, url
        else:
            fetcher = WebsiteFetcher(url=url, job_id=self.job_id, wsman=self.wsman)
            return await fetcher.fetch_url_content(url), url

    async def _run_ai_audit(self, content: str):
        """Runs the AI code audit."""
        assert self.db is not None, "Database session not initialized"
        await self.wsman.send_update("Auditing source code with AI...", self.job_id)
        from .llm import generate_analysis
        result = await generate_analysis(
            content=content,
            db=self.db,
            prompt=CODE_AUDITOR_PROMPT,
            schema=CODE_AUDITOR_SCHEMA,
        )
        return result

    async def _ensure_site_exists(self, identifier: str, site_obj: Site | None = None) -> Site:
        """Gets or creates a Site entry in the database."""
        assert self.db is not None, "Database session not initialized"
        if site_obj:
            return site_obj
        statement = select(Site).where(Site.url == identifier)
        site = (await self.db.exec(statement)).first()
        if not site:
            site = Site(url=identifier)
            self.db.add(site)
            await self.db.commit()
            await self.db.refresh(site)
        return site

    async def _handle_exception(self, e: Exception):
        """Logs an error and sends an update via WebSocket."""
        logger.error(f"Error in task for job {self.job_id}: {e}")
        await self.wsman.send_update(f"An error occurred: {e}", self.job_id)
    
    def _disconnect_ws(self):
        """Disconnects the WebSocket and logs the task completion."""
        self.wsman.disconnect(self.job_id)
        logger.info(f"Task for job {self.job_id} finished and disconnected.")

    async def _process_and_save_analysis(self, site: Site, general_str: str, secret_str: str, domain_info: dict | None) -> AnalysisResult:
        """Processes and saves the scam analysis result."""
        analysis_data = json.loads(general_str.strip().removeprefix("```json").removesuffix("```"))
        secret_analysis = json.loads(secret_str.strip().removeprefix("```json").removesuffix("```"))
        if "detailedAnalysis" in secret_analysis:
            analysis_data.setdefault("detailedAnalysis", []).extend(secret_analysis.get("detailedAnalysis", []))
        analysis_data["domainInfo"] = domain_info
        if domain_info and domain_info.get("domain_age_days") is not None:
            domain_age = domain_info["domain_age_days"]
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
        return await self._save_analysis_to_db(site, analysis_data)

    async def _process_and_save_audit(self, site: Site, audit_str: str) -> AuditResult:
        """Processes and saves the code audit result."""
        audit_data = json.loads(audit_str.strip().removeprefix("```json").removesuffix("```"))
        return await self._save_audit_to_db(site, audit_data)
