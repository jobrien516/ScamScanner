import git
import json
import os
import tempfile
from loguru import logger
from pathlib import Path
from fastapi.concurrency import run_in_threadpool

from ..website_fetcher import WebsiteFetcher
from ..websocket_manager import WebsocketConnectionManager
from ...models.schemas import Site, AuditResult

from ...models.constants import CODE_AUDITOR_PROMPT, CODE_AUDITOR_SCHEMA
from .base import Scanner

class CodeScanner(Scanner):
    """Orchestrates the code audit workflow."""

    def __init__(self, job_id: str, wsman: WebsocketConnectionManager):
        super().__init__(job_id, wsman)
        self.MAX_CONTENT_SIZE = 1_800_000

    async def run(self, url: str | None = None, code: str | None = None):
        """Orchestrates the code audit workflow."""
        try:
            aggregated_content, source_identifier = await self._get_content(url, code)
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

    def _read_repo(self, repo_path: Path) -> str:
        """Synchronously reads all files from a cloned repository, with improved logging and filtering."""
        aggregated_content = ""
        file_count = 0
        total_size = 0

        ignored_extensions = {
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
            ".ico",
            ".webp",
            ".pdf",
            ".zip",
            ".gz",
            ".tar",
            ".DS_Store",
        }

        for root, _, files in os.walk(repo_path):
            for file in files:
                try:
                    full_path = Path(root) / file
                    relative_path = full_path.relative_to(repo_path)
                    if (
                        any(part.startswith(".") for part in relative_path.parts)
                        or any(
                            part in ("node_modules", "venv", ".venv", "dist", "build")
                            for part in relative_path.parts
                        )
                        or relative_path.suffix in ignored_extensions
                    ):
                        logger.debug(f"Skipping ignored file: {relative_path}")
                        continue
                    logger.info(f"Reading file: {relative_path}")

                    file_size = full_path.stat().st_size
                    if total_size + file_size > self.MAX_CONTENT_SIZE:
                        logger.warning(
                            f"Reached content size limit of {self.MAX_CONTENT_SIZE} bytes. Skipping remaining files."
                        )
                        return aggregated_content

                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        aggregated_content += (
                            f"\n\n--- FILE: {relative_path} ---\n\n{content}"
                        )
                        file_count += 1
                        total_size += len(content.encode("utf-8"))
                except Exception as e:
                    logger.warning(f"Could not read file {file}: {e}")

        logger.info(f"Read {file_count} files, total content size: {total_size} bytes.")
        return aggregated_content

    async def _get_content(self, url: str | None, code: str | None) -> tuple[str, str]:
        """Fetches content for auditing from a URL, Git repo, or raw code."""
        if code:
            return code, f"manual_audit_{self.job_id}"
        if not url:
            raise ValueError("Either URL or code must be provided for audit.")
        if "github.com" in url:
            await self.wsman.send_update(
                f"Cloning repository from {url}...", self.job_id
            )
            with tempfile.TemporaryDirectory() as temp_dir:
                await run_in_threadpool(git.Repo.clone_from, url, temp_dir)
                await self.wsman.send_update(
                    "Reading files from repository...", self.job_id
                )
                repo_path = Path(temp_dir)
                aggregated_content = await run_in_threadpool(self._read_repo, repo_path)
                return aggregated_content, url
        else:
            fetcher = WebsiteFetcher(url=url, job_id=self.job_id, wsman=self.wsman)
            return await fetcher.fetch_url_content(url), url

    async def _run_ai_audit(self, content: str):
        """Runs the AI code audit."""
        assert self.db is not None, "Database session not initialized"
        await self.wsman.send_update("Auditing source code with AI...", self.job_id)
        from ..llm import generate_analysis

        result = await generate_analysis(
            content=content,
            db=self.db,
            prompt=CODE_AUDITOR_PROMPT,
            schema=CODE_AUDITOR_SCHEMA,
        )
        return result

    async def _process_and_save_audit(self, site: Site, audit_str: str) -> AuditResult:
        """Processes and saves the code audit result."""
        audit_data = json.loads(
            audit_str.strip().removeprefix("```json").removesuffix("```")
        )
        return await self._save_audit_to_db(site, audit_data)

    async def _save_audit_to_db(self, site: Site, audit_data: dict) -> AuditResult:
        """Saves a new audit result linked to a site."""
        assert self.db is not None, "Database session not initialized"
        logger.info(f"Saving audit for {site.url} to the database.")
        if site.id is None:
            raise ValueError(
                "The Site object must be saved and have an ID before analysis can be saved."
            )
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