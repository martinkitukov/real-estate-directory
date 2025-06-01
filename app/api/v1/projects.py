from fastapi import APIRouter, Depends
from app.dependencies import get_current_developer

router = APIRouter(tags=["Projects"])

@router.get("/")
async def get_projects():
    """Get all projects."""
    return {"message": "Projects endpoint - coming soon"}

@router.post("/")
async def create_project(current_developer = Depends(get_current_developer)):
    """Create a new project."""
    return {"message": "Create project endpoint - coming soon"} 