import re
from pydantic import BaseModel
from loguru import logger
import os
from google import genai
from dotenv import load_dotenv
from loguru import logger
from services.llm import generate_analysis

from models.constants import SYSTEM_PROMPT


def clean_markdown_code_blocks(markdown_text: str) -> str:
    if markdown_text.startswith("```json"):
        markdown_text = markdown_text[len("```json") :].strip()
    if markdown_text.endswith("```"):
        markdown_text = markdown_text[: -len("```")].strip()

    markdown_text = re.sub(r",\s*([\]}])", r"\1", markdown_text)

    return markdown_text


class WebsiteAnalyzer:

    async def analyze_website_html(self, html_content: str) -> str:
        """
        Analyzes the provided HTML content using the generative AI model.

        Args:
            html_content: The HTML content of the website to analyze.

        Returns:
            A JSON string containing the analysis result.
        """
        try:
            logger.info("Starting website HTML analysis.")
            response = await generate_analysis(html=html_content)

            if response:
                logger.info("Successfully received analysis from AI model.")
                return response
            else:
                logger.error(f"AI model returned an empty response. Feedback: {response}")
                raise ValueError("AI model returned no content, possibly due to safety settings or other issues.")

        except Exception as e:
            logger.error(f"Error during website analysis: {e}")
            raise