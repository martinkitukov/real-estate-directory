from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure import get_db
from app.business.auth.admin_service import AdminService
from app.models import User, Developer, VerificationStatus
from app.schemas.auth import (
    AdminRegistrationRequest,
    DeveloperVerificationRequest,
    AdminProfileResponse,
    DeveloperProfileResponse,
    DeveloperListResponse,
    UserType
)
from app.dependencies import get_current_admin

router = APIRouter(tags=["Admin"])


def get_admin_service(db: AsyncSession = Depends(get_db)) -> AdminService:
    """Get admin service instance."""
    return AdminService(db)


@router.post("/create-admin", response_model=AdminProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    admin_data: AdminRegistrationRequest,
    admin_service: AdminService = Depends(get_admin_service)
) -> AdminProfileResponse:
    """
    Create a new admin user. 
    WARNING: This endpoint should be secured/disabled in production!
    """
    try:
        new_admin = await admin_service.create_admin_user(
            email=admin_data.email,
            password=admin_data.password,
            first_name=admin_data.first_name,
            last_name=admin_data.last_name
        )
        
        return AdminProfileResponse(
            id=new_admin.id,
            email=new_admin.email,
            user_type=UserType.ADMIN,
            first_name=new_admin.first_name,
            last_name=new_admin.last_name,
            created_at=new_admin.created_at.isoformat()
        )
        
    except HTTPException:
        raise


@router.get("/developers", response_model=DeveloperListResponse)
async def get_all_developers(
    current_admin: User = Depends(get_current_admin),
    admin_service: AdminService = Depends(get_admin_service)
) -> DeveloperListResponse:
    """Get all developers with their verification status."""
    try:
        developers = await admin_service.get_all_developers()
        
        # Convert to response format
        developer_responses = []
        pending_count = verified_count = rejected_count = 0
        
        for dev in developers:
            # Count by status
            if dev.verification_status == VerificationStatus.PENDING:
                pending_count += 1
            elif dev.verification_status == VerificationStatus.VERIFIED:
                verified_count += 1
            elif dev.verification_status == VerificationStatus.REJECTED:
                rejected_count += 1
            
            # Determine user type
            user_type = (
                UserType.DEVELOPER if dev.verification_status == "verified"
                else UserType.UNVERIFIED_DEVELOPER
            )
            
            developer_responses.append(DeveloperProfileResponse(
                id=dev.id,
                email=dev.email,
                user_type=user_type,
                company_name=dev.company_name,
                contact_person=dev.contact_person,
                phone=dev.phone,
                address=dev.address,
                website=dev.website,
                verification_status=dev.verification_status,
                created_at=dev.created_at.isoformat()
            ))
        
        return DeveloperListResponse(
            developers=developer_responses,
            total_count=len(developers),
            pending_count=pending_count,
            verified_count=verified_count,
            rejected_count=rejected_count
        )
        
    except HTTPException:
        raise


@router.get("/developers/pending", response_model=List[DeveloperProfileResponse])
async def get_pending_developers(
    current_admin: User = Depends(get_current_admin),
    admin_service: AdminService = Depends(get_admin_service)
) -> List[DeveloperProfileResponse]:
    """Get all developers with pending verification status."""
    try:
        developers = await admin_service.get_pending_developers()
        
        return [
            DeveloperProfileResponse(
                id=dev.id,
                email=dev.email,
                user_type=UserType.UNVERIFIED_DEVELOPER,
                company_name=dev.company_name,
                contact_person=dev.contact_person,
                phone=dev.phone,
                address=dev.address,
                website=dev.website,
                verification_status=dev.verification_status,
                created_at=dev.created_at.isoformat()
            )
            for dev in developers
        ]
        
    except HTTPException:
        raise


@router.get("/developers/{developer_id}", response_model=DeveloperProfileResponse)
async def get_developer_details(
    developer_id: int,
    current_admin: User = Depends(get_current_admin),
    admin_service: AdminService = Depends(get_admin_service)
) -> DeveloperProfileResponse:
    """Get detailed information about a specific developer."""
    try:
        developer = await admin_service.get_developer_by_id(developer_id)
        
        user_type = (
            UserType.DEVELOPER if developer.verification_status == "verified"
            else UserType.UNVERIFIED_DEVELOPER
        )
        
        return DeveloperProfileResponse(
            id=developer.id,
            email=developer.email,
            user_type=user_type,
            company_name=developer.company_name,
            contact_person=developer.contact_person,
            phone=developer.phone,
            address=developer.address,
            website=developer.website,
            verification_status=developer.verification_status,
            created_at=developer.created_at.isoformat()
        )
        
    except HTTPException:
        raise


@router.post("/developers/{developer_id}/verify", response_model=DeveloperProfileResponse)
async def verify_developer(
    developer_id: int,
    verification_data: DeveloperVerificationRequest,
    current_admin: User = Depends(get_current_admin),
    admin_service: AdminService = Depends(get_admin_service)
) -> DeveloperProfileResponse:
    """Verify a developer account."""
    try:
        developer = await admin_service.verify_developer(developer_id, current_admin)
        
        return DeveloperProfileResponse(
            id=developer.id,
            email=developer.email,
            user_type=UserType.DEVELOPER,  # Now verified
            company_name=developer.company_name,
            contact_person=developer.contact_person,
            phone=developer.phone,
            address=developer.address,
            website=developer.website,
            verification_status=developer.verification_status,
            created_at=developer.created_at.isoformat()
        )
        
    except HTTPException:
        raise


@router.post("/developers/{developer_id}/reject", response_model=DeveloperProfileResponse)
async def reject_developer(
    developer_id: int,
    rejection_data: DeveloperVerificationRequest,
    current_admin: User = Depends(get_current_admin),
    admin_service: AdminService = Depends(get_admin_service)
) -> DeveloperProfileResponse:
    """Reject a developer account."""
    try:
        developer = await admin_service.reject_developer(
            developer_id, 
            current_admin, 
            reason=rejection_data.reason
        )
        
        return DeveloperProfileResponse(
            id=developer.id,
            email=developer.email,
            user_type=UserType.UNVERIFIED_DEVELOPER,  # Still unverified
            company_name=developer.company_name,
            contact_person=developer.contact_person,
            phone=developer.phone,
            address=developer.address,
            website=developer.website,
            verification_status=developer.verification_status,
            created_at=developer.created_at.isoformat()
        )
        
    except HTTPException:
        raise


@router.post("/developers/{developer_id}/reset", response_model=DeveloperProfileResponse)
async def reset_developer_status(
    developer_id: int,
    current_admin: User = Depends(get_current_admin),
    admin_service: AdminService = Depends(get_admin_service)
) -> DeveloperProfileResponse:
    """Reset developer verification status to pending."""
    try:
        developer = await admin_service.reset_developer_status(developer_id, current_admin)
        
        return DeveloperProfileResponse(
            id=developer.id,
            email=developer.email,
            user_type=UserType.UNVERIFIED_DEVELOPER,
            company_name=developer.company_name,
            contact_person=developer.contact_person,
            phone=developer.phone,
            address=developer.address,
            website=developer.website,
            verification_status=developer.verification_status,
            created_at=developer.created_at.isoformat()
        )
        
    except HTTPException:
        raise 