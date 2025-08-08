from google import genai
from google.genai import types

# import base64
from models.constants import ANALYSIS_SCHEMA, ANALYSIS_PROMPT
from config import get_settings

settings = get_settings()


async def generate_analysis(html: str):
    client = genai.Client(
        # vertexai=True,
        # project="scamscanner-467105",
        # location="global",
        api_key=settings.GEMINI_KEY
    )

    model = "gemini-2.5-pro"
    contents = types.Part(text=ANALYSIS_PROMPT + html)

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


# if __name__ == "__main__":
#     resp = generate()
#     print(resp)

# from pydantic import SecretStr
# from langchain_google_genai import ChatGoogleGenerativeAI
# from api.utils.prompts import build_prompt, RiskAnalysisResults
# from api.config import get_settings

# settings = get_settings()

# llm = ChatGoogleGenerativeAI(
#     model = "gemini-2.5-flash",
#     # google_api_key = SecretStr(str(settings.GEMINI_KEY))
# )


# async def generate_analysis(html: str):
#     prompt = build_prompt(html)
#     structured_llm = llm.with_structured_output(RiskAnalysisResults)
#     response = await structured_llm.ainvoke(str(prompt))
#     return response

# if __name__ == "__main__":
#     import asyncio
#     SCAM_SITE = """
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8">
#     <title>My Awesome Blog</title>
#     <style>body { font-family: sans-serif; }</style>
# </head>
# <body>
#     <header><h1>Welcome to My Blog</h1></header>
#     <main>
#         <article>
#             <h2>My First Post</h2>
#             <p>This is a paragraph in my first blog post. It's safe and sound.</p>
#         </article>
#     </main>
#     <footer>
#         <p>&copy; 2024 My Awesome Blog</p>
#         <a href="/privacy">Privacy Policy</a>
#     </footer>
# </body>
# </html>"""
#     asyncio.run(generate_analysis(SCAM_SITE))
