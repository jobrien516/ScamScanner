import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from config import get_settings
from models.schemas import Base # Make sure your Base is imported

# --- Step 1: Get settings and create the engine and session factory ONCE ---
settings = get_settings()
DATABASE_URL = str(settings.DATABASE_URL)

# Create the engine at the module level. It will be reused across the application.
engine = create_async_engine(DATABASE_URL, echo=False)

# Create the session factory at the module level.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# --- Step 2: Create a clean, reusable dependency ---
async def get_db_session():
    """
    FastAPI dependency that yields a new SQLAlchemy async session.
    It ensures the session is always closed after use.
    """
    async with AsyncSessionLocal() as session:
        yield session

# --- Step 3: Simplify the database initialization logic ---
async def init_db():
    """
    Initializes the database by creating all tables.
    This should be called once on application startup.
    """
    # Use the global engine object
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Check if the SQLite DB file exists after initialization
    if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
        db_path = DATABASE_URL.split('///')[-1]
        if not os.path.exists(db_path):
             print(f"Error: Database file not found at {db_path} after init.")
        else:
            print("Database initialized successfully.")

# import os
# from dataclasses import dataclass
# from typing import Annotated
# from contextlib import asynccontextmanager
# from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
# from scamscan.config import get_settings
# from scamscan.models.schemas import Base
# from fastapi import Depends

# settings = get_settings()

# DB_URL = settings.DATABASE_URL

# async def get_engine():
#     async_engine = create_async_engine(str(DB_URL), echo=False)
#     return async_engine


# @asynccontextmanager
# async def get_session():
#     engine = await get_engine()
#     async_session = async_sessionmaker(
#         bind=engine, class_=AsyncSession, expire_on_commit=False
#     )
#     async with async_session() as session:
#         try:
#             yield session
#         finally:
#             await session.close()

# def is_sqlite_db_missing():
#     """Check if the SQLite DB file exists at the given DB_URL. Returns True if missing or not SQLite."""
#     if DB_URL and DB_URL.startswith("sqlite"):
#         db_path = DB_URL.split('///')[-1]
#         return not os.path.exists(db_path)
#     return False

# async def ensure_db_initialized():
#     """Check if DB exists, and if not, initialize it."""
#     if is_sqlite_db_missing():
#         await init_db()

# async def init_db():
#     engine = await get_engine()
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#     session = async_sessionmaker(
#         bind=engine, class_=AsyncSession, expire_on_commit=False
#     )
#     return session


# @dataclass
# class DbManager:
#     def __init__(self, session: Annotated = Depends(get_session)):
#         self.session = session

#     async def get_conn(self):
#         async with get_session() as session:
#             self.session = session
#             return self.session

#     async def start_db(self):
#         return self.session.begin()

#     async def close_db(self):
#         return self.session.close()

#     async def execute_query(self, query):
#         result = await self.session.execute(query)
#         return result

#     async def commit_changes(self):
#         await self.session.commit()

#     async def __aenter__(self):
#         await self.start_db()

#     async def __aexit__(self, exc_type, exc_val, exc_tb):
#         if exc_type is not None:
#             self.session.rollback()
#         await self.close_db()
