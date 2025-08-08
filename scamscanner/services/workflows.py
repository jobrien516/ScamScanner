import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from loguru import logger

from services.website_fetcher import WebsiteFetcher
from services.analyzer import WebsiteAnalyzer
from models.schemas import AnalysisResultDB, RiskLevel

async def _save_analysis_to_db(db: AsyncSession, url: str, analysis_data: dict):
    """Asynchronously saves or updates an analysis result in the database."""
    logger.info(f"Saving analysis for {url} to the database.")

    # Check if a result for this URL already exists
    result = await db.execute(
        select(AnalysisResultDB).filter(AnalysisResultDB.site_url == url)
    )
    existing_record: AnalysisResultDB | None = result.scalar_one_or_none()
    
    risk_level_str = analysis_data.get("overallRisk", "UNKNOWN").replace(" ", "_").upper()
    risk_level_enum = RiskLevel[risk_level_str]

    if existing_record:
        # Update the existing record
        existing_record.overall_risk = risk_level_enum.name  # type: ignore
        existing_record.risk_score = analysis_data.get("riskScore", 0)
        existing_record.summary = analysis_data.get("summary", "")
        existing_record.detailed_analysis = analysis_data.get("detailedAnalysis", [])
    else:
        # Create a new record object
        new_record = AnalysisResultDB(
            site_url=url,
            overall_risk=risk_level_enum.name,
            risk_score=analysis_data.get("riskScore", 0),
            summary=analysis_data.get("summary", ""),
            detailed_analysis=analysis_data.get("detailedAnalysis", [])
        )
        db.add(new_record)
    
    await db.commit()

async def main_workflow(url: str, db: AsyncSession):
    """Performs the full analysis workflow using an async database session."""
    fetcher = WebsiteFetcher(url)
    analyzer = WebsiteAnalyzer()

    html_content = await fetcher.fetch_website_html()
    analysis_result_str = await analyzer.analyze_website_html(html_content)
    analysis_dict = json.loads(analysis_result_str)
    
    await _save_analysis_to_db(db=db, url=url, analysis_data=analysis_dict)

    return analysis_dict

# import asyncio
# import json
# from sqlalchemy.orm import Session

# from models.schemas import AnalysisResultDB
# from models.analysis import RiskLevel
# from services.db import DbManager
# from loguru import logger
# from services.website_fetcher import WebsiteFetcher
# from services.analyzer import WebsiteAnalyzer


# async def main_workflow(url: str, db: Session):
#     """
#     Fetches, analyzes, and saves website data using a provided database session.
#     """
#     fetcher = WebsiteFetcher(url)
#     analyzer = WebsiteAnalyzer()

#     # Step 1 & 2: Fetch and Analyze
#     html_content = await fetcher.fetch_website_html()
#     analysis_result_str = await analyzer.analyze_website_html(html_content)
#     analysis_data = json.loads(analysis_result_str)

#     logger.info(f"Analysis for {url} complete. Saving results.")
    
#     risk_level_str = analysis_data.get("overallRisk", "UNKNOWN").replace(" ", "_").upper()
#     risk_level_enum = RiskLevel[risk_level_str]

#     # Create the database object with the analysis data
#     analysis_db_object = AnalysisResultDB(
#         site_url=url,
#         overall_risk=risk_level_enum.name, 
#         risk_score=analysis_data.get("riskScore", 0),
#         summary=analysis_data.get("summary", ""),
#         detailed_analysis=analysis_data.get("detailedAnalysis", [])
#     )

#     db.merge(analysis_db_object)
#     db.commit()

#     logger.info(f"Successfully saved analysis result for {url} to database.")

#     await fetcher.save_to_db(url, html_content)

#     return analysis_data

# # async def main_workflow(url: str):
# #     fetcher = WebsiteFetcher(url)
# #     analyzer = WebsiteAnalyzer()

# #     try:
# #         html_content = await fetcher.fetch_website_html()
# #         print(f"Fetched HTML content for {url}")
# #     except Exception as e:
# #         print(f"Failed to fetch HTML content: {e}")
# #         return



# #     try:
# #         analysis_result = await analyzer.analyze_website_html(html_content)
# #         print(f"Analysis Result: {analysis_result}")
# #     except Exception as e:
# #         print(f"Failed to analyze HTML content: {e}")
# #         return

# #     # Save the HTML to the sites table
# #     await fetcher.save_to_db(url, html_content)

# #     # Save the analysis result to the analysis_results table
# #     try:
# #         # Parse the analysis_result string to dict
# #         if isinstance(analysis_result, str):
# #             analysis_data = json.loads(analysis_result)
# #         else:
# #             analysis_data = analysis_result

# #         # Map string risk level to RiskLevel enum
# #         risk_level_str = analysis_data.get("overallRisk", "UNKNOWN")
# #         try:
# #             risk_level = RiskLevel[risk_level_str.replace(" ", "_").upper()]
# #         except KeyError:
# #             risk_level = RiskLevel.UNKNOWN

# #         # Prepare AnalysisResultDB instance
# #         analysis_db = AnalysisResultDB(
# #             site_url=url,
# #             overall_risk=risk_level,
# #             risk_score=analysis_data.get("riskScore", 0),
# #             summary=analysis_data.get("summary", ""),
# #             detailed_analysis=analysis_data.get("detailedAnalysis", [])
# #         )

# #         db_manager = DbManager()
# #         session = await db_manager.get_conn()
# #         if session:
# #             async with session as db:
# #                 db.add(analysis_db)
# #                 await db.commit()
# #                 print(f"Saved analysis result for {url} to database.")
# #         else:
# #             print("No active DB session for saving analysis result.")
# #     except Exception as e:
# #         print(f"Failed to save analysis result to database: {e}")


# # # Usage example
# # if __name__ == "__main__":
# #     target_url = "http://backgroundreport.live/score006"
# #     asyncio.run(main_workflow(target_url))
