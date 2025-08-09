import re
from pydantic import BaseModel
from loguru import logger
import os
from google import genai
from dotenv import load_dotenv
from loguru import logger
from .llm import generate_analysis

from ..models.constants import SYSTEM_PROMPT, SECRET_ANALYSIS_PROMPT


def clean_markdown_code_blocks(markdown_text: str) -> str:
    if markdown_text.startswith("```json"):
        markdown_text = markdown_text[len("```json") :].strip()
    if markdown_text.endswith("```"):
        markdown_text = markdown_text[: -len("```")].strip()

    markdown_text = re.sub(r",\s*([\]}])", r"\1", markdown_text)

    return markdown_text


class WebsiteAnalyzer:

    async def analyze_content(self, content: str) -> str:
        """
        Analyzes the provided text content using the generative AI model.

        Args:
            content: The text content of the website to analyze (HTML, JS, etc.).

        Returns:
            A JSON string containing the analysis result.
        """
        try:
            logger.info("Starting website content analysis.")
            response = await generate_analysis(content=content)

            if response:
                logger.info("Successfully received analysis from AI model.")
                return response
            else:
                logger.error(f"AI model returned an empty response. Feedback: {response}")
                raise ValueError("AI model returned no content, possibly due to safety settings or other issues.")

        except Exception as e:
            logger.error(f"Error during website analysis: {e}")
            raise

    async def analyze_for_secrets(self, content: str) -> str:
        """
        Analyzes the provided content for exposed secrets.
        """
        try:
            logger.info("Starting secret analysis.")
            response = await generate_analysis(content=content, prompt=SECRET_ANALYSIS_PROMPT)
            if response:
                logger.info("Successfully received secret analysis from AI model.")
                return response
            else:
                logger.error(f"AI model returned an empty response for secrets scan. Feedback: {response}")
                raise ValueError("AI model returned no content for secrets scan.")
        except Exception as e:
            logger.error(f"Error during secret analysis: {e}")
            raise