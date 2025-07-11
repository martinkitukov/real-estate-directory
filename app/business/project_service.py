from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from geoalchemy2.functions import ST_SetSRID, ST_Point
import json

from app.models.project import Project, ProjectStatus, ProjectType
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectSearch


class ProjectService:
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_projects(self, search_params) -> dict:
        """Get projects with search and pagination
        
        Args:
            search_params: Either ProjectSearch object or dict with search parameters
            
        Returns:
            dict: ProjectListResponse format with projects, total, page, per_page, total_pages
        """
        
        # Handle both ProjectSearch objects and dictionaries
        if isinstance(search_params, dict):
            # Convert dict to object for easier access
            class SearchParams:
                def __init__(self, **kwargs):
                    for key, value in kwargs.items():
                        setattr(self, key, value)
                        
            params = SearchParams(**search_params)
        else:
            params = search_params
        
        query = select(Project).where(Project.is_active == True)
        
        # Apply filters
        if getattr(params, 'search', None):
            search_term = f"%{params.search}%"
            query = query.where(
                or_(
                    Project.title.ilike(search_term),
                    Project.description.ilike(search_term),
                    Project.location_text.ilike(search_term),
                    Project.city.ilike(search_term),
                    Project.neighborhood.ilike(search_term)
                )
            )
        
        if getattr(params, 'city', None):
            query = query.where(Project.city == params.city)
            
        if getattr(params, 'project_type', None):
            query = query.where(Project.project_type == params.project_type)
            
        if getattr(params, 'status', None):
            query = query.where(Project.status == params.status)
            
        if getattr(params, 'developer_id', None):
            query = query.where(Project.developer_id == params.developer_id)
        
        # Get total count for pagination
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        page = getattr(params, 'page', 1)
        per_page = getattr(params, 'per_page', 10)
        
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        # Include developer relationship
        query = query.options(selectinload(Project.developer))
        
        # Execute query
        result = await self.db.execute(query)
        projects = result.scalars().all()
        
        # Calculate total pages
        total_pages = (total + per_page - 1) // per_page if total > 0 else 1
        
        # Convert to response format
        from app.schemas.project import ProjectResponse
        
        project_responses = []
        for project in projects:
            # Extract coordinates if available
            latitude, longitude = self.extract_coordinates(project)
            
            project_data = {
                "id": project.id,
                "developer_id": project.developer_id,
                "title": project.title,
                "description": project.description,
                "location_text": project.location_text,
                "city": project.city,
                "neighborhood": project.neighborhood,
                "country": project.country,
                "project_type": project.project_type,
                "status": project.status,
                "expected_completion_date": project.expected_completion_date,
                "cover_image_url": project.cover_image_url,
                "gallery_urls": json.loads(project.gallery_urls or "[]"),
                "amenities_list": json.loads(project.amenities_list or "[]"),
                "latitude": latitude,
                "longitude": longitude,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "is_active": project.is_active,
                "is_verified": project.is_verified
            }
            project_responses.append(ProjectResponse(**project_data))
        
        return {
            "projects": project_responses,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    
    async def get_project_by_id(self, project_id: int) -> Optional[Project]:
        """Get a single project by ID"""
        query = select(Project).where(
            and_(Project.id == project_id, Project.is_active == True)
        ).options(selectinload(Project.developer))
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create_project(
        self, 
        project_data: ProjectCreate, 
        developer_id: int
    ) -> Project:
        """Create a new project"""
        
        # Convert data to dict and handle special fields
        project_dict = project_data.model_dump(exclude={"latitude", "longitude", "gallery_urls", "amenities_list"})
        
        # Ensure enum values are converted to the actual enum values (not names)
        if isinstance(project_data.project_type, ProjectType):
            project_dict['project_type'] = project_data.project_type.value
        if isinstance(project_data.status, ProjectStatus):
            project_dict['status'] = project_data.status.value
        
        # Create the project instance
        project = Project(
            **project_dict,
            developer_id=developer_id,
            gallery_urls=json.dumps(project_data.gallery_urls or []),
            amenities_list=json.dumps(project_data.amenities_list or [])
        )
        
        # Set PostGIS point if coordinates provided
        if project_data.latitude is not None and project_data.longitude is not None:
            project.location_point = ST_SetSRID(
                ST_Point(project_data.longitude, project_data.latitude), 4326
            )
        
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        
        return project
    
    async def update_project(
        self,
        project_id: int,
        project_data: ProjectUpdate,
        developer_id: int
    ) -> Optional[Project]:
        """Update an existing project"""
        
        # Get the project and verify ownership
        query = select(Project).where(
            and_(
                Project.id == project_id,
                Project.developer_id == developer_id,
                Project.is_active == True
            )
        )
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()
        
        if not project:
            return None
        
        # Update fields
        update_data = project_data.model_dump(exclude_unset=True)
        
        # Handle special fields
        if "gallery_urls" in update_data:
            project.gallery_urls = json.dumps(update_data.pop("gallery_urls") or [])
            
        if "amenities_list" in update_data:
            project.amenities_list = json.dumps(update_data.pop("amenities_list") or [])
        
        # Handle coordinates
        latitude = update_data.pop("latitude", None)
        longitude = update_data.pop("longitude", None)
        
        if latitude is not None and longitude is not None:
            project.location_point = ST_SetSRID(ST_Point(longitude, latitude), 4326)
        
        # Update remaining fields
        for field, value in update_data.items():
            setattr(project, field, value)
        
        await self.db.commit()
        await self.db.refresh(project)
        
        return project
    
    async def delete_project(
        self,
        project_id: int,
        developer_id: int
    ) -> bool:
        """Soft delete a project (set is_active = False)"""
        
        query = select(Project).where(
            and_(
                Project.id == project_id,
                Project.developer_id == developer_id,
                Project.is_active == True
            )
        )
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()
        
        if not project:
            return False
        
        project.is_active = False
        await self.db.commit()
        
        return True
    
    @staticmethod
    def extract_coordinates(project: Project) -> tuple[Optional[float], Optional[float]]:
        """Extract latitude and longitude from PostGIS point"""
        if not project.location_point:
            return None, None
        
        # This would need to be implemented based on your PostGIS setup
        # For now, return None - can be enhanced later
        return None, None 