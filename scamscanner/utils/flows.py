# import json
# import asyncio
# from sqlmodel.ext.asyncio.session import AsyncSession
# from sqlmodel import select
# from sqlalchemy.orm import selectinload
# from loguru import logger

# from ..services.website_fetcher import WebsiteFetcher
# from ..services.analyzer import WebsiteAnalyzer
# from ..services.domain_analyzer import DomainAnalyzer
# from ..services.pipe import Pipe
# from ..models.schemas import AnalysisResult, Site
# from ..services.websocket_manager import WebsocketConnectionManager
# from ..services.db import get_db_session

# wsman = WebsocketConnectionManager()

# def _calculate_overall_risk(analysis_data: dict) -> dict:
#     """Calculates a new risk score and level based on all findings."""
#     severity_points = {"Low": 3, "Medium": 11, "High": 19, "Very High": 29}

#     total_score = 0
#     for finding in analysis_data.get("detailedAnalysis", []):
#         total_score += severity_points.get(finding.get("severity"), 0)

#     risk_score = min(total_score, 100)

#     if risk_score > 90:
#         overall_risk = "Very High"
#     elif risk_score > 55:
#         overall_risk = "High"
#     elif risk_score > 20:
#         overall_risk = "Medium"
#     else:
#         overall_risk = "Low"

#     analysis_data["riskScore"] = risk_score
#     analysis_data["overallRisk"] = overall_risk

#     return analysis_data

# def clean_json_block(s: str) -> str:
#     """Remove ```json ... ``` syntax from LLM results if present."""
#     return s.strip().removeprefix("```json").removesuffix("```").strip()

# async def fetch_content_and_site(url, content, scan_depth, wsman, db, job_id):
#     """
#     Handles fetching site content and retrieving Site from DB.
#     Returns (aggregated_content, site)
#     """
#     aggregated_content = ""
#     site = None

#     if content:
#         await wsman.send_update("Analyzing provided content...", job_id)
#         aggregated_content = content
#     else:
#         fetcher = WebsiteFetcher(url=url, job_id=job_id, wsman=wsman)
#         if scan_depth == "deep":
#             await fetcher.download_site(session=db)
#         else:
#             await wsman.send_update(f"Fetching content from {url}...", job_id)
#             aggregated_content = await fetcher.fetch_url_content(url)

#         statement = (
#             select(Site)
#             .options(selectinload(Site.sub_pages))  # type: ignore
#             .where(Site.url == url)
#         )
#         result = await db.exec(statement)
#         site = result.first()
#         if not site and scan_depth == "deep":
#             raise Exception(f"Site {url} not found after download process.")
#         if site and scan_depth == "deep":
#             aggregated_content = " ".join(
#                 [sub_page.content for sub_page in site.sub_pages]
#             )
#     return aggregated_content, site

# async def lookup_domain_info(url, domain_analyzer, wsman, job_id):
#     """
#     Handles WHOIS lookup and timeout logic. Returns domain_info dict or None.
#     """
#     await wsman.send_update("Using WHOIS to find out who owns this jawn...", job_id)
#     domain_info = None
#     try:
#         domain_info = await asyncio.wait_for(
#             domain_analyzer.get_domain_info(url), timeout=15.0
#         )
#     except asyncio.TimeoutError:
#         logger.warning(f"WHOIS lookup for {url} timed out.")
#         await wsman.send_update(
#             "WHOIS lookup timed out, continuing analysis...", job_id
#         )
#     return domain_info

# async def ensure_site_exists(url, db, site):
#     """
#     Ensure site exists in DB. Returns a Site instance.
#     """
#     if not site:
#         site_statement = select(Site).where(Site.url == url)
#         res = await db.exec(site_statement)
#         site = res.first()
#         if not site:
#             site = Site(url=url)
#             db.add(site)
#             await db.commit()
#             await db.refresh(site)
#     return site

# async def _save_analysis_to_db(
#     db: AsyncSession, site: Site, analysis_data: dict
# ) -> AnalysisResult:
#     """Saves a new analysis result linked to a site, ensuring data is normalized."""
#     logger.info(f"Saving analysis for {site.url} to the database.")

#     if site.id is None:
#         raise ValueError(
#             "The Site object must be saved and have an ID before analysis can be saved."
#         )

#     analysis_data["site_id"] = site.id
#     analysis_data["site_url"] = site.url
#     final_analysis = _calculate_overall_risk(analysis_data)
#     new_record = AnalysisResult.model_validate(final_analysis)

#     db.add(new_record)
#     await db.commit()
#     await db.refresh(new_record)
#     return new_record

# def inject_domain_intelligence(analysis_data, domain_info):
#     """
#     Injects domain intelligence signals into analysis_data.
#     Modifies analysis_data in-place.
#     """
#     if domain_info and domain_info.get("domain_age_days") is not None:
#         domain_age = domain_info["domain_age_days"]
#         severity = "Low"
#         reasons = []
        
#         # Domain age
#         if domain_age < 30:
#             severity = "High"
#             reasons.append("Domain age is less than 30 days.")
#         elif domain_age < 180:
#             severity = "Medium"
#             reasons.append("Domain age is less than 180 days.")
        
#         # Known bad registrars
#         KNOWN_BAD_REGISTRARS = {"NameSilo, LLC", "Alibaba Cloud Computing (Beijing) Co., Ltd.", "NowCN"}
#         registrar = domain_info.get("registrar", "N/A")
#         if registrar in KNOWN_BAD_REGISTRARS:
#             severity = "High"
#             reasons.append(f"Registrar '{registrar}' is commonly associated with scam domains.")
        
#         # WHOIS Privacy
#         if domain_info.get("whois_privacy", False):  # Assume bool or inferrable
#             severity = "Medium" if severity != "High" else "High"
#             reasons.append("WHOIS privacy/proxy is enabled.")
        
#         # Suspicious domain patterns
#         import re
#         domain_name = domain_info.get("domain", "")
#         if re.search(r"\d{4,}", domain_name) or re.search(r"(paypal|amazon|bank)", domain_name, re.I):
#             severity = "High"
#             reasons.append(f"Domain name '{domain_name}' matches suspicious pattern.")

#         # TLD reputation
#         suspicious_tlds = {".top", ".xyz", ".online"}
#         tld = domain_name.split('.')[-1] if '.' in domain_name else ''
#         if f".{tld}" in suspicious_tlds:
#             severity = "Medium" if severity == "Low" else severity
#             reasons.append(f"TLD .{tld} is frequently used for abuse.")

#         # Combine reasons
#         detailed_reason = " ".join(reasons) if reasons else "No high-risk signals detected."

#         analysis_data["detailedAnalysis"].insert(
#             0,
#             {
#                 "category": "Domain Intelligence",
#                 "severity": severity,
#                 "description": (
#                     f"Domain registered on {domain_info.get('creation_date')}. "
#                     f"Age: {domain_age} days. "
#                     f"Registrar: {registrar}. "
#                     f"{detailed_reason}"
#                 ),
#             },
#         )

# async def save_and_report(final_result_model, wsman, job_id):
#     """
#     Sends the final report result via websocket.
#     """
#     await wsman.send_final_result(
#         json.loads(final_result_model.model_dump_json()), job_id
#     )

# async def summarize_findings(data, db, **kwargs):
#     """Summarize findings using LLM."""
#     from ..services.llm import generate_analysis
#     summary = await generate_analysis(content=data, db=db, prompt="Summarize the findings.")
#     return summary

# async def run_analysis(
#     url: str,
#     job_id: str,
#     wsman: WebsocketConnectionManager,
#     content: str | None = None,
#     scan_depth: str = "deep",
# ):
#     """
#     The main analysis workflow run as a background task.
#     """
#     async with get_db_session() as db:
#         try:
#             analyzer = WebsiteAnalyzer()
#             domain_analyzer = DomainAnalyzer()
#             aggregated_content = ""
#             domain_info = None
#             site = None

#             # ----------- Site Content Fetching -----------
#             if content:
#                 await wsman.send_update("Analyzing provided content...", job_id)
#                 aggregated_content = content
#             else:
#                 fetcher = WebsiteFetcher(url=url, job_id=job_id, wsman=wsman)
#                 if scan_depth == "deep":
#                     await fetcher.download_site(session=db)
#                 else:
#                     await wsman.send_update(f"Fetching content from {url}...", job_id)
#                     aggregated_content = await fetcher.fetch_url_content(url)

#                 statement = (
#                     select(Site)
#                     .options(selectinload(Site.sub_pages))  # type: ignore
#                     .where(Site.url == url)
#                 )
#                 result = await db.exec(statement)
#                 site = result.first()
#                 if not site and scan_depth == "deep":
#                     raise Exception(f"Site {url} not found after download process.")

#                 if site and scan_depth == "deep":
#                     aggregated_content = " ".join(
#                         [sub_page.content for sub_page in site.sub_pages]
#                     )

#                 await wsman.send_update(
#                     "Using WHOIS to find out who owns this jawn...", job_id
#                 )
#                 try:
#                     domain_info = await asyncio.wait_for(
#                         domain_analyzer.get_domain_info(url), timeout=15.0
#                     )
#                 except asyncio.TimeoutError:
#                     logger.warning(f"WHOIS lookup for {url} timed out.")
#                     await wsman.send_update(
#                         "WHOIS lookup timed out, continuing analysis...", job_id
#                     )

#             # Ensure site exists in DB
#             if not site:
#                 site_statement = select(Site).where(Site.url == url)
#                 res = await db.exec(site_statement)
#                 site = res.first()
#                 if not site:
#                     site = Site(url=url)
#                     db.add(site)
#                     await db.commit()
#                     await db.refresh(site)

#             # ----------- Set up Pipelines -----------
#             gp = Pipe()
#             gp.add_stage(lambda data: analyzer.analyze_content(data, db))
#             gp.add_stage(lambda data: summarize_findings(data, db))

#             sp = Pipe()
#             sp.add_stage(lambda data: analyzer.analyze_for_secrets(data, db))

#             # ----------- Run Analysis Pipelines -----------
#             await wsman.send_update("Scanning for exposed secrets big and small...", job_id)
#             secret_analysis_str = await sp.run(aggregated_content, db=db)

#             await wsman.send_update("Analyzing for scammy looking stuff...", job_id)
#             general_analysis_str = await gp.run(aggregated_content, db=db)

#             await wsman.send_update("Sniffing...", job_id)

#             # ----------- Parse and Merge Results -----------
#             analysis_data = json.loads(clean_json_block(general_analysis_str))
#             secret_analysis = json.loads(clean_json_block(secret_analysis_str))

#             analysis_data.setdefault("detailedAnalysis", []).extend(
#                 secret_analysis.get("detailedAnalysis", [])
#             )
#             analysis_data["domainInfo"] = domain_info

#             # ----------- Domain Intelligence Injection -----------
#             if domain_info and domain_info.get("domain_age_days") is not None:
#                 domain_age = domain_info["domain_age_days"]
#                 severity = "Low"
#                 reasons = []
                
#                 # Domain age logic (existing)
#                 if domain_age < 30:
#                     severity = "High"
#                     reasons.append("Domain age is less than 30 days.")
#                 elif domain_age < 180:
#                     severity = "Medium"
#                     reasons.append("Domain age is less than 180 days.")
                
#                 # Known bad registrars
#                 KNOWN_BAD_REGISTRARS = {"NameSilo, LLC", "Alibaba Cloud Computing (Beijing) Co., Ltd.", "NowCN"}
#                 registrar = domain_info.get("registrar", "N/A")
#                 if registrar in KNOWN_BAD_REGISTRARS:
#                     severity = "High"
#                     reasons.append(f"Registrar '{registrar}' is commonly associated with scam domains.")
                
#                 # WHOIS Privacy
#                 if domain_info.get("whois_privacy", False):  # Assume bool or inferrable
#                     severity = "Medium" if severity != "High" else "High"
#                     reasons.append("WHOIS privacy/proxy is enabled.")
                
#                 # Suspicious domain patterns
#                 import re
#                 domain_name = domain_info.get("domain", "")
#                 if re.search(r"\d{4,}", domain_name) or re.search(r"(paypal|amazon|bank)", domain_name, re.I):
#                     severity = "High"
#                     reasons.append(f"Domain name '{domain_name}' matches suspicious pattern.")

#                 # TLD reputation
#                 suspicious_tlds = {".top", ".xyz", ".online"}
#                 tld = domain_name.split('.')[-1] if '.' in domain_name else ''
#                 if f".{tld}" in suspicious_tlds:
#                     severity = "Medium" if severity == "Low" else severity
#                     reasons.append(f"TLD .{tld} is frequently used for abuse.")

#                 # Combine reasons
#                 detailed_reason = " ".join(reasons) if reasons else "No high-risk signals detected."

#                 analysis_data["detailedAnalysis"].insert(
#                     0,
#                     {
#                         "category": "Domain Intelligence",
#                         "severity": severity,
#                         "description": (
#                             f"Domain registered on {domain_info.get('creation_date')}. "
#                             f"Age: {domain_age} days. "
#                             f"Registrar: {registrar}. "
#                             f"{detailed_reason}"
#                         ),
#                     },
#                 )

#             # ----------- Persist and Report Result -----------
#             final_result_model = await _save_analysis_to_db(
#                 db=db, site=site, analysis_data=analysis_data
#             )

#             await wsman.send_final_result(
#                 json.loads(final_result_model.model_dump_json()), job_id
#             )

#         except Exception as e:
#             logger.error(f"Error in analysis task for job {job_id}: {e}")
#             await wsman.send_update(f"An error occurred during analysis: {e}", job_id)
#         finally:
#             wsman.disconnect(job_id)
#             logger.info(f"Analysis task for job {job_id} finished and disconnected.")