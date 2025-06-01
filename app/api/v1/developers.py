from fastapi import APIRouter, Depends
from app.dependencies import get_current_developer

router = APIRouter(tags=["Developers"])

@router.get("/")
async def get_developers():
    """Get all developers."""
    return {"message": "Developers endpoint - coming soon"}

@router.get("/me")
async def get_my_developer_info(current_developer = Depends(get_current_developer)):
    """Get current developer information."""
    return {"message": "Developer info endpoint - coming soon"} 