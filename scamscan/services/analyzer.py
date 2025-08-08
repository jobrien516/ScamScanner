import re
from pydantic import BaseModel
from loguru import logger
from config import get_settings
from services.llm import generate_analysis

settings = get_settings()


def clean_markdown_code_blocks(markdown_text: str) -> str:
    if markdown_text.startswith("```json"):
        markdown_text = markdown_text[len("```json") :].strip()
    if markdown_text.endswith("```"):
        markdown_text = markdown_text[: -len("```")].strip()

    markdown_text = re.sub(r",\s*([\]}])", r"\1", markdown_text)

    return markdown_text


class WebsiteAnalyzer(BaseModel):
    api_key: str = str(settings.GEMINI_KEY)

    async def analyze_website_html(self, html: str):
        if not self.api_key:
            raise EnvironmentError(
                "API_KEY environment variable not set. Please configure your API key."
            )

        try:
            json_text = await generate_analysis(html)
            if not json_text:
                raise ValueError("AI returned an empty response. Please try again.")
            result = clean_markdown_code_blocks(str(json_text))

            return result

        except Exception as e:
            logger.error(f"Error analyzing website with Gemini: {e}")
            raise RuntimeError(f"AI analysis failed: {str(e)}")
