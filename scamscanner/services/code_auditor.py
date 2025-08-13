import json
import asyncio
from loguru import logger
from sqlmodel.ext.asyncio.session import AsyncSession

from .websocket_manager import WebsocketConnectionManager
from ..services.db import get_db_session
from .llm import generate_analysis
from ..models.constants import CODE_AUDITOR_PROMPT, CODE_AUDITOR_SCHEMA


class CodeAuditor:
    """
    Encapsulates the logic for performing a code audit.
    """

    def __init__(self, job_id: str, wsman: WebsocketConnectionManager):
        self.job_id = job_id
        self.wsman = wsman

    async def run_audit(self, code: str):
        """
        The main code audit workflow, run as a background task.
        It analyzes the given code and sends the results back via WebSocket.
        """
        async with get_db_session() as db:
            try:
                await self.wsman.send_update("Analyzing source code...", self.job_id)
                await asyncio.sleep(0)

                analysis_str = await generate_analysis(
                    content=code, db=db, prompt=CODE_AUDITOR_PROMPT, schema=CODE_AUDITOR_SCHEMA
                )

                analysis_data = json.loads(
                    str(analysis_str)
                    .strip()
                    .removeprefix("```json")
                    .removesuffix("```")
                )

                await self.wsman.send_final_result(analysis_data, self.job_id)

            except Exception as e:
                logger.error(f"Error in code audit task for job {self.job_id}: {e}")
                await self.wsman.send_update(
                    f"An error occurred during analysis: {e}", self.job_id
                )
            finally:
                self.wsman.disconnect(self.job_id)
                logger.info(
                    f"Code audit task for job {self.job_id} finished and disconnected."
                )
