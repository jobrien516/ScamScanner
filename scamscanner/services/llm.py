from google import genai
from google.genai import types

from ..models.constants import ANALYSIS_SCHEMA, ANALYSIS_PROMPT
from ..config import settings

async def generate_analysis(content: str, prompt: str = ANALYSIS_PROMPT):
    client = genai.Client(
        api_key=settings.GEMINI_KEY
    )

    model = "gemini-2.5-pro"
    contents = types.Part(text=prompt + content)

    generate_content_config = types.GenerateContentConfig(
        temperature=0,
        top_p=0.0,
        max_output_tokens=65535,
        response_mime_type="application/json",
        response_json_schema=ANALYSIS_SCHEMA,
        thinking_config=types.ThinkingConfig(
            thinking_budget=2048,
        ),
    )
    response = client.models.generate_content(
        model=model, contents=contents, config=generate_content_config
    )
    return response.text