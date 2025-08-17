from google import genai
from google.genai import types
from sqlmodel.ext.asyncio.session import AsyncSession
from models.schemas import Settings

from models.constants import ANALYSIS_SCHEMA
from config import settings as env_settings


async def generate_analysis(
    content: str, db: AsyncSession, prompt: str, schema: dict = ANALYSIS_SCHEMA
):
    """
    Analyzes content using the synchronous Gemini API with settings from the DB.
    """
    db_settings = await db.get(Settings, 1)
    api_key = (
        db_settings.gemini_api_key
        if db_settings and db_settings.gemini_api_key
        else env_settings.GEMINI_KEY
    )
    if not api_key:
        raise ValueError("Gemini API key is not configured in settings or environment.")

    max_tokens = db_settings.max_output_tokens if db_settings else -1

    client = genai.Client(api_key=api_key)

    model = env_settings.GEMINI_MODEL
    contents = types.Part(text=prompt + content)

    generate_content_config = types.GenerateContentConfig(
        temperature=0,
        top_p=0.0,
        max_output_tokens=max_tokens,
        response_mime_type="application/json",
        response_json_schema=schema,
    )
    response = client.models.generate_content(
        model=model, contents=contents, config=generate_content_config
    )
    return response.text
