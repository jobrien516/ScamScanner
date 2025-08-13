import asyncio
import git
import json
import os
import tempfile
from loguru import logger
from pathlib import Path
from fastapi.concurrency import run_in_threadpool
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload

from ..website_fetcher import WebsiteFetcher
from ..analyzer import WebsiteAnalyzer
from ..domain_analyzer import DomainAnalyzer
from ..websocket_manager import WebsocketConnectionManager
from ...models.schemas import AnalysisResult, Site, AuditResult
from ...services.db import get_db_session
from ...models.constants import CODE_AUDITOR_PROMPT, CODE_AUDITOR_SCHEMA


class Scanner:
    """Base class for orchestrating analysis workflows."""

    def __init__(self, job_id: str, wsman: WebsocketConnectionManager):
        self.job_id = job_id
        self.wsman = wsman
        self.db_session_context = get_db_session()
        self.db: AsyncSession | None = None

    async def __aenter__(self):
        self.db = await self.db_session_context.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.db_session_context.__aexit__(exc_type, exc_val, exc_tb)

    async def _ensure_site_exists(
        self, identifier: str, site_obj: Site | None = None
    ) -> Site:
        """Gets or creates a Site entry in the database."""
        assert self.db is not None, "Database session not initialized"
        if site_obj:
            return site_obj
        statement = select(Site).where(Site.url == identifier)
        if not (site := (await self.db.exec(statement)).first()):
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
