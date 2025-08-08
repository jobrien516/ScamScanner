from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scamscan.api.endpoints import router

app = FastAPI(
    title="ScamScanner API",
    description="API for scamscan",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    

    uvicorn.run(app, host="0.0.0.0", port=8000)