# from services.workflows import main_workflow
from services.db import init_db

if __name__ == "__main__":
    import asyncio

    asyncio.run(init_db())

    # asyncio.run(main_workflow("https://backgroundreport.live/score006"))
