import asyncio
import json
from loguru import logger
from sqlmodel import select
from sqlalchemy.orm import selectinload

from services.scanners.base import Scanner
from services.website_fetcher import WebsiteFetcher
from services.analyzer import WebsiteAnalyzer
from services.domain_analyzer import DomainAnalyzer
from services.websocket_manager import WebsocketConnectionManager
from models.schemas import AnalysisResult, Site

class ScamScanner(Scanner):
    """Orchestrates the scam analysis workflow."""

    def __init__(self, job_id: str, wsman: WebsocketConnectionManager):
        super().__init__(job_id, wsman)
        self.analyzer = WebsiteAnalyzer()

    async def run(
        self,
        url: str,
        content: str | None = None,
        scan_depth: str = "deep",
        use_secrets_scanner: bool = True,
        use_domain_analyzer: bool = True,
    ):
        """Orchestrates the scam analysis workflow."""
        try:
            aggregated_content, site = await self._get_content_for_analysis(
                url, content, scan_depth
            )
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

    async def _get_content_for_analysis(
        self, url: str, content: str | None, scan_depth: str
    ) -> tuple[str, Site | None]:
        """Fetches website content based on the provided inputs."""
        assert self.db is not None, "Database session not initialized"
        if content:
            await self.wsman.send_update("Analyzing provided content...", self.job_id)
            return content, None
        fetcher = WebsiteFetcher(url=url, job_id=self.job_id, wsman=self.wsman)
        if scan_depth == "deep":
            await fetcher.download_site(session=self.db)
            statement = (
                select(Site)
                .options(selectinload(Site.sub_pages))  # type: ignore
                .where(Site.url == url)
            )  # type: ignore
            site = (await self.db.exec(statement)).first()
            if not (site := (await self.db.exec(statement)).first()):
                raise Exception(f"Site {url} not found after download.")
            aggregated_content = " ".join(
                sub_page.content for sub_page in site.sub_pages
            )
            return aggregated_content, site
        else:
            await self.wsman.send_update(f"Fetching content from {url}...", self.job_id)
            aggregated_content = await fetcher.fetch_url_content(url)
            return aggregated_content, None

    async def _get_domain_info(self, url: str) -> dict | None:
        """Performs a WHOIS lookup for the given URL."""
        await self.wsman.send_update(
            "Performing domain intelligence lookup...", self.job_id
        )
        domain_analyzer = DomainAnalyzer()
        try:
            return await asyncio.wait_for(
                domain_analyzer.get_domain_info(url), timeout=15.0
            )
        except asyncio.TimeoutError:
            logger.warning(f"WHOIS lookup for {url} timed out.")
            await self.wsman.send_update(
                "WHOIS lookup timed out, continuing...", self.job_id
            )
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

    async def _process_and_save_analysis(
        self, site: Site, general_str: str, secret_str: str, domain_info: dict | None
    ) -> AnalysisResult:
        """Processes and saves the scam analysis result."""
        analysis_data = json.loads(
            general_str.strip().removeprefix("```json").removesuffix("```")
        )
        secret_analysis = json.loads(
            secret_str.strip().removeprefix("```json").removesuffix("```")
        )
        if "detailedAnalysis" in secret_analysis:
            analysis_data.setdefault("detailedAnalysis", []).extend(
                secret_analysis.get("detailedAnalysis", [])
            )
        analysis_data["domainInfo"] = domain_info
        if (
            domain_info
            and (domain_age := domain_info.get("domain_age_days")) is not None
        ):
            severity = "Low"
            if domain_age < 30:
                severity = "High"
            elif domain_age < 180:
                severity = "Medium"
            analysis_data["detailedAnalysis"].insert(
                0,
                {
                    "category": "Domain Intelligence",
                    "severity": severity,
                    "description": f"Domain registered on {domain_info['creation_date']}. Age: {domain_age} days. Registrar: {domain_info.get('registrar', 'N/A')}.",
                },
            )
        return await self._save(site, analysis_data)

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

    async def _save(self, site: Site, analysis_data: dict) -> AnalysisResult:
        """Saves a new analysis result linked to a site, ensuring data is normalized."""
        assert self.db is not None, "Database session not initialized"
        logger.info(f"Saving analysis for {site.url} to the database.")
        if site.id is None:
            raise ValueError(
                "The Site object must be saved and have an ID before analysis can be saved."
            )
        analysis_data["site_id"] = site.id
        analysis_data["site_url"] = site.url
        final_analysis = self._calculate_overall_risk(analysis_data)
        new_record = AnalysisResult.model_validate(final_analysis)
        self.db.add(new_record)
        await self.db.commit()
        await self.db.refresh(new_record)
        return new_record
