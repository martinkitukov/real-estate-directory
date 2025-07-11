from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.project import ProjectStatus, ProjectType


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    location_text: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    neighborhood: Optional[str] = None
    country: str = Field(default="Bulgaria")
    project_type: ProjectType
    status: ProjectStatus
    expected_completion_date: Optional[datetime] = None
    cover_image_url: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    amenities_list: Optional[List[str]] = None


class ProjectCreate(ProjectBase):
    # Coordinates for PostGIS point
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    location_text: Optional[str] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    country: Optional[str] = None
    project_type: Optional[ProjectType] = None
    status: Optional[ProjectStatus] = None
    expected_completion_date: Optional[datetime] = None
    cover_image_url: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    amenities_list: Optional[List[str]] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    is_active: Optional[bool] = None


class ProjectResponse(ProjectBase):
    id: int
    developer_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# Search/Filter schemas
class ProjectSearch(BaseModel):
    search: Optional[str] = None
    city: Optional[str] = None
    project_type: Optional[ProjectType] = None
    status: Optional[ProjectStatus] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    developer_id: Optional[int] = None  # Filter by specific developer
    page: int = Field(1, ge=1)
    per_page: int = Field(10, ge=1, le=100) 