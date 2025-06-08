from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.models import User, Developer, UserRole, VerificationStatus
from app.schemas.auth import DeveloperProfileResponse, UserType


class AdminService:
    """Business logic for admin operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_pending_developers(self) -> List[Developer]:
        """Get all developers with pending verification status."""
        result = await self.db.execute(
            select(Developer).where(Developer.verification_status == VerificationStatus.PENDING)
        )
        return result.scalars().all()

    async def get_all_developers(self) -> List[Developer]:
        """Get all developers regardless of verification status."""
        result = await self.db.execute(select(Developer))
        return result.scalars().all()

    async def verify_developer(self, developer_id: int, admin: User) -> Developer:
        """Verify a developer account."""
        # Get the developer
        result = await self.db.execute(
            select(Developer).where(Developer.id == developer_id)
        )
        developer = result.scalar_one_or_none()
        
        if not developer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Developer not found"
            )
        
        if developer.verification_status == VerificationStatus.VERIFIED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Developer is already verified"
            )
        
        # Update verification status
        developer.verification_status = VerificationStatus.VERIFIED
        await self.db.commit()
        await self.db.refresh(developer)
        
        return developer

    async def reject_developer(self, developer_id: int, admin: User, reason: Optional[str] = None) -> Developer:
        """Reject a developer account."""
        # Get the developer
        result = await self.db.execute(
            select(Developer).where(Developer.id == developer_id)
        )
        developer = result.scalar_one_or_none()
        
        if not developer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Developer not found"
            )
        
        if developer.verification_status == VerificationStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Developer is already rejected"
            )
        
        # Update verification status
        developer.verification_status = VerificationStatus.REJECTED
        # TODO: Add reason field to Developer model and store rejection reason
        await self.db.commit()
        await self.db.refresh(developer)
        
        return developer

    async def reset_developer_status(self, developer_id: int, admin: User) -> Developer:
        """Reset developer verification status to pending."""
        # Get the developer
        result = await self.db.execute(
            select(Developer).where(Developer.id == developer_id)
        )
        developer = result.scalar_one_or_none()
        
        if not developer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Developer not found"
            )
        
        # Update verification status
        developer.verification_status = VerificationStatus.PENDING
        await self.db.commit()
        await self.db.refresh(developer)
        
        return developer

    async def get_developer_by_id(self, developer_id: int) -> Developer:
        """Get a specific developer by ID."""
        result = await self.db.execute(
            select(Developer).where(Developer.id == developer_id)
        )
        developer = result.scalar_one_or_none()
        
        if not developer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Developer not found"
            )
        
        return developer

    async def create_admin_user(self, email: str, password: str, first_name: str, last_name: str) -> User:
        """Create a new admin user. This should be used carefully, typically only during setup."""
        from app.infrastructure import hash_password
        
        # Check if email already exists
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if email exists in developers table
        result = await self.db.execute(
            select(Developer).where(Developer.email == email)
        )
        existing_developer = result.scalar_one_or_none()
        
        if existing_developer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create admin user
        admin = User(
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=UserRole.ADMIN
        )

        self.db.add(admin)
        await self.db.commit()
        await self.db.refresh(admin)
        return admin

    async def get_all_admins(self) -> List[User]:
        """Get all admin users in the system."""
        result = await self.db.execute(
            select(User).where(User.role == UserRole.ADMIN)
        )
        return result.scalars().all() 