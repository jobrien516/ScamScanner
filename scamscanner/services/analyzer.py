import re
from loguru import logger
from .llm import generate_analysis

from ..models.constants import SECRET_ANALYSIS_PROMPT


def clean_markdown_code_blocks(markdown_text: str) -> str:
    if markdown_text.startswith("```json"):
        markdown_text = markdown_text[len("```json") :].strip()
    if markdown_text.endswith("```"):
        markdown_text = markdown_text[: -len("```")].strip()

    markdown_text = re.sub(r",\s*([\]}])", r"\1", markdown_text)

    return markdown_text


class WebsiteAnalyzer:
    def analyze_content(self, content: str) -> str:
        """
        Analyzes the provided text content using the generative AI model.
        """
        try:
            logger.info("Starting website content analysis.")
            response = generate_analysis(content=content)

            if response:
                logger.info("Successfully received analysis from AI model.")
                return response
            else:
                logger.error("AI model returned an empty response.")
                raise ValueError("AI model returned no content.")
        except Exception as e:
            logger.error(f"Error during website analysis: {e}")
            raise

    def analyze_for_secrets(self, content: str) -> str:
        """
        Analyzes the provided content for exposed secrets.
        """
        try:
            logger.info("Starting secret analysis.")
            response = generate_analysis(content=content, prompt=SECRET_ANALYSIS_PROMPT)
            if response:
                logger.info("Successfully received secret analysis from AI model.")
                return response
            else:
                logger.error("AI model returned an empty response for secrets scan.")
                raise ValueError("AI model returned no content for secrets scan.")
        except Exception as e:
            logger.error(f"Error during secret analysis: {e}")
            raise