from fastapi import Request
from fastapi.responses import JSONResponse
from loguru import logger

from .exceptions import WebsiteFetchError
from .app import app


@app.exception_handler(WebsiteFetchError)
async def website_fetch_exception_handler(request: Request, exc: WebsiteFetchError):
    """
    Handles WebsiteFetchError exceptions globally, returning a 400 response.
    """
    logger.error(f"Caught a website fetch error: {exc.message}")
    return JSONResponse(
        status_code=400,
        content={"detail": f"Could not access the website. Reason: {exc.message}"},
    )


@app.get("/")
def read_root():
    """Defines the root endpoint for the API."""
    return {"message": "Welcome to the ScamScanner API"}


# async def main():
#     fetcher = WebsiteFetcher("https://backgroundreport.live/score006")
#     async with get_db_session() as session:
#         await fetcher.download_site(session)


# if __name__ == "__main__":
#     import asyncio
#     import uvicorn

#     asyncio.run(main())

#     asyncio.run(create_db_and_tables())
#     uvicorn.run(app, host="0.0.0.0", port=8000)
#     asyncio.run(main_workflow("https://backgroundreport.live/score006"))
