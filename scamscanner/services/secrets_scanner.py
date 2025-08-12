import json
import asyncio
from sqlmodel.ext.asyncio.session import AsyncSession
from loguru import logger

from .website_fetcher import WebsiteFetcher
from .analyzer import WebsiteAnalyzer
from ..models.schemas import AnalysisResult, Site
from .websocket_manager import WebsocketConnectionManager
from ..services.db import get_db_session
from .workflows import _calculate_overall_risk, _save_analysis_to_db

class SecretsScanner:
    def __init__(self, job_id: str, wsman: WebsocketConnectionManager):
        self.job_id = job_id
        self.wsman = wsman
        self.analyzer = WebsiteAnalyzer()

    async def run_analysis(self, content: str | None = None, url: str | None = None):
        """
        Runs the secrets analysis on the provided content or URL.
        """
        async with get_db_session() as db:
            try:
                if url:
                    await self.wsman.send_update(f"Fetching content from {url}...", self.job_id)
                    fetcher = WebsiteFetcher(url=url, job_id=self.job_id, wsman=self.wsman)
                    content_to_scan = await fetcher.fetch_url_content(url)
                    source_identifier = url
                elif content:
                    content_to_scan = content
                    source_identifier = f"manual_scan_{self.job_id}"
                else:
                    raise ValueError("Either 'url' or 'content' must be provided.")

                await self.wsman.send_update("Scanning for exposed secrets...", self.job_id)
                await asyncio.sleep(0)
                secret_analysis_str = await self.analyzer.analyze_for_secrets(content_to_scan, db=db)

                secret_analysis = json.loads(
                    secret_analysis_str.strip().removeprefix("```json").removesuffix("```")
                )

                site = Site(url=source_identifier)
                db.add(site)
                await db.commit()
                await db.refresh(site)

                analysis_data = {
                    "summary": "Secrets scan completed.",
                    "detailedAnalysis": secret_analysis.get("detailedAnalysis", []),
                }
                
                final_analysis = _calculate_overall_risk(analysis_data)
                
                final_result_model = await _save_analysis_to_db(
                    db=db, site=site, analysis_data=final_analysis
                )

                await self.wsman.send_final_result(
                    json.loads(final_result_model.model_dump_json()), self.job_id
                )

            except Exception as e:
                logger.error(f"Error in secrets analysis task for job {self.job_id}: {e}")
                await self.wsman.send_update(f"An error occurred during analysis: {e}", self.job_id)
            finally:
                self.wsman.disconnect(self.job_id)
                logger.info(f"Secrets analysis task for job {self.job_id} finished and disconnected.")


# import json
# import asyncio
# from sqlmodel.ext.asyncio.session import AsyncSession
# from loguru import logger

# from .website_fetcher import WebsiteFetcher
# from .analyzer import WebsiteAnalyzer
# from ..models.schemas import AnalysisResult, Site
# from .websocket_manager import WebsocketConnectionManager
# from ..services.db import get_db_session
# from .workflows import _calculate_overall_risk, _save_analysis_to_db

# async def run_secrets_analysis(
#     job_id: str,
#     wsman: WebsocketConnectionManager,
#     content: str,
#     source_identifier: str,
# ):
#     """
#     An isolated workflow for scanning content for exposed secrets.
#     """
#     async with get_db_session() as db:
#         try:
#             analyzer = WebsiteAnalyzer()
            
#             await wsman.send_update(
#                 "Scanning for exposed secrets...", job_id
#             )
#             await asyncio.sleep(0)
#             secret_analysis_str = await analyzer.analyze_for_secrets(content, db=db)

#             secret_analysis = json.loads(
#                 secret_analysis_str.strip().removeprefix("```json").removesuffix("```")
#             )

#             site = Site(url=source_identifier)
#             db.add(site)
#             await db.commit()
#             await db.refresh(site)

#             analysis_data = {
#                 "summary": "Secrets scan completed.",
#                 "detailedAnalysis": secret_analysis.get("detailedAnalysis", []),
#             }
            
#             final_analysis = _calculate_overall_risk(analysis_data)
            
#             final_result_model = await _save_analysis_to_db(
#                 db=db, site=site, analysis_data=final_analysis
#             )

#             await wsman.send_final_result(
#                 json.loads(final_result_model.model_dump_json()), job_id
#             )

#         except Exception as e:
#             logger.error(f"Error in secrets analysis task for job {job_id}: {e}")
#             await wsman.send_update(f"An error occurred during analysis: {e}", job_id)
#         finally:
#             wsman.disconnect(job_id)
#             logger.info(f"Secrets analysis task for job {job_id} finished and disconnected.")