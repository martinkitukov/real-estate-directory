from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.dependencies import get_current_developer, get_db
from app.business.project_service import ProjectService
from app.schemas.project import (
    ProjectCreate, 
    ProjectUpdate, 
    ProjectResponse, 
    ProjectListResponse,
    ProjectSearch
)
from app.models.user import User

router = APIRouter(tags=["Projects"])


@router.get("/", response_model=ProjectListResponse)
async def get_projects(
    search: str = Query(None, description="Search in title, description, location"),
    city: str = Query(None, description="Filter by city"),
    project_type: str = Query(None, description="Filter by project type"),
    status: str = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """Get all projects with search and filtering."""
    
    search_params = ProjectSearch(
        search=search,
        city=city,
        project_type=project_type,
        status=status,
        page=page,
        per_page=per_page
    )
    
    project_service = ProjectService(db)
    result = await project_service.get_projects(search_params)
    
    return ProjectListResponse(**result)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a single project by ID."""
    
    project_service = ProjectService(db)
    project = await project_service.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Parse JSON fields
    gallery_urls = json.loads(project.gallery_urls) if project.gallery_urls else []
    amenities_list = json.loads(project.amenities_list) if project.amenities_list else []
    
    # Get coordinates
    latitude, longitude = ProjectService.extract_coordinates(project)
    
    return ProjectResponse(
        id=project.id,
        developer_id=project.developer_id,
        title=project.title,
        description=project.description,
        location_text=project.location_text,
        city=project.city,
        neighborhood=project.neighborhood,
        country=project.country,
        project_type=project.project_type,
        status=project.status,
        expected_completion_date=project.expected_completion_date,
        cover_image_url=project.cover_image_url,
        gallery_urls=gallery_urls,
        amenities_list=amenities_list,
        latitude=latitude,
        longitude=longitude,
        created_at=project.created_at,
        updated_at=project.updated_at,
        is_active=project.is_active,
        is_verified=project.is_verified
    )


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    current_developer: User = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project."""
    
    project_service = ProjectService(db)
    project = await project_service.create_project(project_data, current_developer.id)
    
    # Parse JSON fields for response
    gallery_urls = json.loads(project.gallery_urls) if project.gallery_urls else []
    amenities_list = json.loads(project.amenities_list) if project.amenities_list else []
    
    # Get coordinates
    latitude, longitude = ProjectService.extract_coordinates(project)
    
    return ProjectResponse(
        id=project.id,
        developer_id=project.developer_id,
        title=project.title,
        description=project.description,
        location_text=project.location_text,
        city=project.city,
        neighborhood=project.neighborhood,
        country=project.country,
        project_type=project.project_type,
        status=project.status,
        expected_completion_date=project.expected_completion_date,
        cover_image_url=project.cover_image_url,
        gallery_urls=gallery_urls,
        amenities_list=amenities_list,
        latitude=latitude,
        longitude=longitude,
        created_at=project.created_at,
        updated_at=project.updated_at,
        is_active=project.is_active,
        is_verified=project.is_verified
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_developer: User = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing project."""
    
    project_service = ProjectService(db)
    project = await project_service.update_project(project_id, project_data, current_developer.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not authorized")
    
    # Parse JSON fields for response
    gallery_urls = json.loads(project.gallery_urls) if project.gallery_urls else []
    amenities_list = json.loads(project.amenities_list) if project.amenities_list else []
    
    # Get coordinates
    latitude, longitude = ProjectService.extract_coordinates(project)
    
    return ProjectResponse(
        id=project.id,
        developer_id=project.developer_id,
        title=project.title,
        description=project.description,
        location_text=project.location_text,
        city=project.city,
        neighborhood=project.neighborhood,
        country=project.country,
        project_type=project.project_type,
        status=project.status,
        expected_completion_date=project.expected_completion_date,
        cover_image_url=project.cover_image_url,
        gallery_urls=gallery_urls,
        amenities_list=amenities_list,
        latitude=latitude,
        longitude=longitude,
        created_at=project.created_at,
        updated_at=project.updated_at,
        is_active=project.is_active,
        is_verified=project.is_verified
    )


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    current_developer: User = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    """Delete a project (soft delete)."""
    
    project_service = ProjectService(db)
    success = await project_service.delete_project(project_id, current_developer.id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found or not authorized")
    
    return {"message": "Project deleted successfully"} 