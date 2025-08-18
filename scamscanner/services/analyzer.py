import re
import json
from loguru import logger
from services.llm import generate_analysis
from sqlmodel.ext.asyncio.session import AsyncSession

from models.constants import (
    SECRET_ANALYSIS_PROMPT,
    ANALYSIS_PROMPT,
    ANALYSIS_SCHEMA
    )


def clean_markdown_code_blocks(markdown_text: str) -> str:
    if markdown_text.startswith("```json"):
        markdown_text = markdown_text[len("```json") :].strip()
    if markdown_text.endswith("```"):
        markdown_text = markdown_text[: -len("```")].strip()

    markdown_text = re.sub(r",\s*([\]}])", r"\1", markdown_text)

    return markdown_text


class WebsiteAnalyzer:
    async def analyze_content(self, content: str, db: AsyncSession) -> str:
        """
        Analyzes the provided text content using the generative AI model.
        """
        try:
            logger.info("Starting website content analysis.")
            response = await generate_analysis(
                content=content, db=db, prompt=ANALYSIS_PROMPT, schema=ANALYSIS_SCHEMA
            )
            if response:
                logger.info("Successfully received analysis from AI model.")
                return response
            else:
                logger.warning("AI model returned an empty response for content analysis. Returning default empty result.")
                return json.dumps({
                    "overallRisk": "Unknown",
                    "riskScore": 0,
                    "summary": "AI analysis could not be completed for this section.",
                    "detailedAnalysis": []
                })
        except Exception as e:
            logger.error(f"Error during website analysis: {e}")
            raise

    async def analyze_for_secrets(self, content: str, db: AsyncSession) -> str:
        """
        Analyzes the provided content for exposed secrets.
        """
        try:
            logger.info("Starting secret analysis.")
            response = await generate_analysis(
                content=content, db=db, prompt=SECRET_ANALYSIS_PROMPT
            )
            if response:
                logger.info("Successfully received secret analysis from AI model.")
                return response
            else:
                logger.warning("AI model returned an empty response for secrets scan. Returning default empty result.")
                return json.dumps({"detailedAnalysis": []})
        except Exception as e:
            logger.error(f"Error during secret analysis: {e}")
            raise
