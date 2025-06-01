from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Union, Tuple

from app.infrastructure import hash_password, verify_password, generate_token
from app.models import User, Developer, UserRole, VerificationStatus
from app.schemas.auth import BuyerRegistrationRequest, DeveloperRegistrationRequest, UserLoginRequest


class AuthService:
    """Business logic for user authentication and authorization"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_buyer(self, user_data: BuyerRegistrationRequest) -> User:
        """
        Create a new buyer account in the database.
        """
        # Check if email already exists
        result = await self.db.execute(
            select(User).where(User.email == user_data.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if email exists in developers table
        result = await self.db.execute(
            select(Developer).where(Developer.email == user_data.email)
        )
        existing_developer = result.scalar_one_or_none()
        
        if existing_developer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=UserRole.BUYER
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def register_developer(self, developer_data: DeveloperRegistrationRequest) -> Developer:
        """
        Create a new developer account in the database.
        """
        # Check if email already exists
        result = await self.db.execute(
            select(User).where(User.email == developer_data.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if email exists in developers table
        result = await self.db.execute(
            select(Developer).where(Developer.email == developer_data.email)
        )
        existing_developer = result.scalar_one_or_none()
        
        if existing_developer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new developer
        developer = Developer(
            email=developer_data.email,
            password_hash=hash_password(developer_data.password),
            company_name=developer_data.company_name,
            contact_person=developer_data.contact_person,
            phone=developer_data.phone,
            address=developer_data.address,
            website=developer_data.website,
            verification_status=VerificationStatus.PENDING
        )
        
        self.db.add(developer)
        await self.db.commit()
        await self.db.refresh(developer)
        return developer

    async def authenticate_user(self, login_data: UserLoginRequest) -> Tuple[Union[User, Developer], str]:
        """
        Authenticate a user and generate an authorization token if successful.
        """
        # Try to find user first
        result = await self.db.execute(
            select(User).where(User.email == login_data.email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            if not verify_password(login_data.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is deactivated"
                )
            
            token = generate_token(user.email)
            return user, token

        # Try to find developer
        result = await self.db.execute(
            select(Developer).where(Developer.email == login_data.email)
        )
        developer = result.scalar_one_or_none()
        
        if developer:
            if not verify_password(login_data.password, developer.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            token = generate_token(developer.email)
            return developer, token

        # No user found
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    async def get_current_user(self, token: str) -> Union[User, Developer]:
        """
        Get current user from JWT token.
        """
        from app.infrastructure import verify_token
        
        try:
            email = verify_token(token)
        except HTTPException:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Try to find user first
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is deactivated"
                )
            return user
        
        # Try to find developer
        result = await self.db.execute(
            select(Developer).where(Developer.email == email)
        )
        developer = result.scalar_one_or_none()
        
        if developer:
            return developer
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 