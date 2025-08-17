from typing import List
from fastapi import (
    APIRouter,
    HTTPException,
)
from loguru import logger
from sqlmodel import select, delete
from sqlalchemy import desc

from models.schemas import AnalysisResult
from services.db import get_db_session

history_router = APIRouter()


@history_router.get("/history", response_model=List[AnalysisResult])
async def get_analysis_history():
    """Retrieves all analysis results from the database, ordered by most recent."""
    try:
        async with get_db_session() as db:
            statement = select(AnalysisResult).order_by(
                desc(AnalysisResult.last_analyzed_at)  # type: ignore
            )
            results = await db.exec(statement)
            return results.all()
    except Exception as e:
        logger.error(f"Failed to fetch analysis history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analysis history.")


@history_router.delete("/history")
async def delete_analysis_history():
    """Deletes all analysis results from the database."""
    try:
        async with get_db_session() as db:
            statement = delete(AnalysisResult)
            await db.exec(statement)  # type: ignore
            await db.commit()
            return {"message": "Analysis history successfully cleared."}
    except Exception as e:
        logger.error(f"Failed to delete analysis history: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to delete analysis history."
        )
