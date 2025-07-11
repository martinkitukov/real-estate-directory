from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta

from app.infrastructure import get_db
from app.dependencies import get_current_developer
from app.models import Developer, Project
from app.schemas.project import ProjectResponse, ProjectListResponse

router = APIRouter(tags=["Developers"])

@router.get("/")
async def get_developers():
    """Get all developers."""
    return {"message": "Developers endpoint - coming soon"}

@router.get("/me")
async def get_my_developer_info(
    current_developer: Developer = Depends(get_current_developer)
):
    """Get current developer information."""
    return {
        "id": current_developer.id,
        "email": current_developer.email,
        "company_name": current_developer.company_name,
        "contact_person": current_developer.contact_person,
        "phone": current_developer.phone,
        "address": current_developer.address,
        "website": current_developer.website,
        "verification_status": current_developer.verification_status,
        "created_at": current_developer.created_at.isoformat()
    }

@router.get("/projects", response_model=ProjectListResponse)
async def get_my_projects(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in title or location"),
    status: Optional[str] = Query(None, description="Filter by project status"),
    project_type: Optional[str] = Query(None, description="Filter by project type"),
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    """Get projects owned by the current developer."""
    try:
        from app.business.project_service import ProjectService
        
        project_service = ProjectService(db)
        
        # Build search parameters
        search_params = {
            "page": page,
            "per_page": per_page,
            "developer_id": current_developer.id  # Only show this developer's projects
        }
        
        if search:
            search_params["search"] = search
        if status:
            search_params["status"] = status
        if project_type:
            search_params["project_type"] = project_type
            
        return await project_service.get_projects(search_params)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch developer projects: {str(e)}"
        )

@router.get("/stats")
async def get_developer_stats(
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics for the current developer."""
    try:
        from sqlalchemy import select
        
        # Get total projects count
        total_projects_query = select(func.count(Project.id)).where(
            and_(
                Project.developer_id == current_developer.id,
                Project.is_active == True
            )
        )
        total_projects_result = await db.execute(total_projects_query)
        total_projects = total_projects_result.scalar() or 0
        
        # Get projects by status
        projects_query = select(Project).where(
            and_(
                Project.developer_id == current_developer.id,
                Project.is_active == True
            )
        )
        projects_result = await db.execute(projects_query)
        projects = projects_result.scalars().all()
        
        # Calculate stats
        status_counts = {}
        total_views = 0  # This would come from analytics table in real app
        total_inquiries = 0  # This would come from inquiries table in real app
        active_leads = 0  # This would come from leads table in real app
        
        for project in projects:
            status = project.status
            status_counts[status] = status_counts.get(status, 0) + 1
            # In a real app, you'd join with analytics tables here
            total_views += 100  # Mock data for now
            total_inquiries += 5  # Mock data for now
            active_leads += 2  # Mock data for now
        
        # Calculate growth (mock data - in real app, compare with previous period)
        projects_growth = "+2 this month"
        views_growth = "+12% this week"
        inquiries_growth = "+8 this week"
        leads_growth = "+3 this week"
        
        return {
            "total_projects": total_projects,
            "total_views": total_views,
            "total_inquiries": total_inquiries,
            "active_leads": active_leads,
            "projects_growth": projects_growth,
            "views_growth": views_growth,
            "inquiries_growth": inquiries_growth,
            "leads_growth": leads_growth,
            "status_breakdown": status_counts,
            "recent_activity": [
                {
                    "id": 1,
                    "message": f"New project created: {projects[0].title if projects else 'Sample Project'}",
                    "time": "2 hours ago",
                    "unread": True
                },
                {
                    "id": 2,
                    "message": "Project status updated",
                    "time": "1 day ago",
                    "unread": True
                },
                {
                    "id": 3,
                    "message": "Monthly analytics report ready",
                    "time": "2 days ago",
                    "unread": False
                }
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch developer stats: {str(e)}"
        )

@router.get("/analytics")
async def get_developer_analytics(
    period: str = Query("week", description="Analytics period: week, month, year"),
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics data for the current developer."""
    try:
        # In a real app, this would query analytics tables
        # For now, return mock data
        
        if period == "week":
            return {
                "period": "week",
                "projects_views": [120, 150, 140, 180, 200, 175, 220],
                "inquiries": [5, 8, 6, 12, 15, 10, 18],
                "leads": [2, 3, 2, 4, 5, 3, 6],
                "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            }
        elif period == "month":
            return {
                "period": "month",
                "projects_views": [3200, 3500, 3800, 4100],
                "inquiries": [150, 180, 200, 220],
                "leads": [60, 70, 85, 95],
                "labels": ["Week 1", "Week 2", "Week 3", "Week 4"]
            }
        else:  # year
            return {
                "period": "year",
                "projects_views": [15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000],
                "inquiries": [800, 950, 1100, 1250, 1400, 1600, 1750, 1900, 2100, 2250, 2400, 2600],
                "leads": [320, 380, 440, 500, 560, 640, 700, 760, 840, 900, 960, 1040],
                "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics: {str(e)}"
        )

@router.get("/subscription")
async def get_subscription_info(
    current_developer: Developer = Depends(get_current_developer)
):
    """Get subscription information for the current developer."""
    # In a real app, this would come from a subscriptions table
    return {
        "plan": "Premium",
        "projects_used": 1,  # Would be calculated from actual projects
        "projects_limit": 25,
        "renewal_date": "2025-01-15",
        "status": "active",
        "features": [
            "Unlimited property listings",
            "Advanced analytics",
            "Priority support",
            "Custom branding"
        ]
    } 