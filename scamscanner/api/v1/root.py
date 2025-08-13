from fastapi import APIRouter

root_router = APIRouter()


@root_router.get("/")
def read_root():
    """Defines the root endpoint for the API."""
    return {"message": "Welcome to the ScamScanner API"}
