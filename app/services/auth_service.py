"""
Authentication service layer.
Following Single Responsibility and Dependency Inversion principles.
"""
from typing import Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.db.models import User, Developer
from app.schemas.auth import (
    BuyerRegistrationRequest,
    DeveloperRegistrationRequest,
    UserLoginRequest,
    UserType
)
from app.core.security import PasswordManager, JWTManager, create_user_token_data


class AuthenticationError(HTTPException):
    """Custom authentication error."""
    def __init__(self, detail: str, error_code: str):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )
        self.error_code = error_code


class RegistrationError(HTTPException):
    """Custom registration error."""
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class AuthService:
    """
    Authentication service handling all auth-related business logic.
    Following Single Responsibility Principle.
    """
    
    def __init__(self, db: AsyncSession):
        """
        Dependency Inversion: Depends on abstraction (AsyncSession) not concretion.
        """
        self.db = db
    
    async def register_buyer(
        self, 
        registration_data: BuyerRegistrationRequest
    ) -> User:
        """
        Register a new buyer.
        
        Args:
            registration_data: Buyer registration information
            
        Returns:
            Created User instance
            
        Raises:
            RegistrationError: If email already exists or other validation fails
        """
        # Check if email already exists
        existing_user = await self._get_user_by_email(registration_data.email)
        if existing_user:
            raise RegistrationError("Email already registered")
        
        # Create new buyer
        hashed_password = PasswordManager.get_password_hash(registration_data.password)
        
        new_user = User(
            email=registration_data.email,
            password_hash=hashed_password,
            first_name=registration_data.first_name,
            last_name=registration_data.last_name,
            user_type=UserType.BUYER
        )
        
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        
        return new_user
    
    async def register_developer(
        self, 
        registration_data: DeveloperRegistrationRequest
    ) -> Developer:
        """
        Register a new developer (unverified by default).
        
        Args:
            registration_data: Developer registration information
            
        Returns:
            Created Developer instance
            
        Raises:
            RegistrationError: If email already exists or other validation fails
        """
        # Check if email already exists in both users and developers
        existing_user = await self._get_user_by_email(registration_data.email)
        existing_developer = await self._get_developer_by_email(registration_data.email)
        
        if existing_user or existing_developer:
            raise RegistrationError("Email already registered")
        
        # Create new developer (unverified by default)
        hashed_password = PasswordManager.get_password_hash(registration_data.password)
        
        new_developer = Developer(
            email=registration_data.email,
            password_hash=hashed_password,
            company_name=registration_data.company_name,
            contact_person=registration_data.contact_person,
            phone=registration_data.phone,
            address=registration_data.address,
            website=registration_data.website,
            verification_status="pending"  # Default to pending verification
        )
        
        self.db.add(new_developer)
        await self.db.commit()
        await self.db.refresh(new_developer)
        
        return new_developer
    
    async def authenticate_user(
        self, 
        login_data: UserLoginRequest
    ) -> tuple[Union[User, Developer], str]:
        """
        Authenticate user and return user instance with JWT token.
        
        Args:
            login_data: Login credentials
            
        Returns:
            Tuple of (user_instance, access_token)
            
        Raises:
            AuthenticationError: If credentials are invalid
        """
        # Try to find user in buyers table
        user = await self._get_user_by_email(login_data.email)
        if user and PasswordManager.verify_password(login_data.password, user.password_hash):
            token_data = create_user_token_data(user.id, UserType.BUYER)
            access_token = JWTManager.create_access_token(token_data)
            return user, access_token
        
        # Try to find user in developers table
        developer = await self._get_developer_by_email(login_data.email)
        if developer and PasswordManager.verify_password(login_data.password, developer.password_hash):
            # Determine user type based on verification status
            user_type = (
                UserType.DEVELOPER if developer.verification_status == "verified"
                else UserType.UNVERIFIED_DEVELOPER
            )
            
            token_data = create_user_token_data(developer.id, user_type)
            access_token = JWTManager.create_access_token(token_data)
            return developer, access_token
        
        # If no valid user found
        raise AuthenticationError(
            detail="Invalid email or password",
            error_code="AUTH_INVALID_CREDENTIALS"
        )
    
    async def get_current_user(
        self, 
        token: str
    ) -> Union[User, Developer]:
        """
        Get current user from JWT token.
        
        Args:
            token: JWT access token
            
        Returns:
            User or Developer instance
            
        Raises:
            AuthenticationError: If token is invalid or user not found
        """
        # Extract user data from token
        user_data = JWTManager.extract_user_data_from_token(token)
        if not user_data:
            raise AuthenticationError(
                detail="Invalid authentication token",
                error_code="AUTH_INVALID_TOKEN"
            )
        
        user_id = user_data["user_id"]
        user_type = user_data["user_type"]
        
        # Get user based on type
        if user_type == UserType.BUYER:
            user = await self._get_user_by_id(user_id)
            if not user:
                raise AuthenticationError(
                    detail="User not found",
                    error_code="AUTH_USER_NOT_FOUND"
                )
            return user
        
        elif user_type in [UserType.DEVELOPER, UserType.UNVERIFIED_DEVELOPER]:
            developer = await self._get_developer_by_id(user_id)
            if not developer:
                raise AuthenticationError(
                    detail="Developer not found",
                    error_code="AUTH_USER_NOT_FOUND"
                )
            return developer
        
        else:
            raise AuthenticationError(
                detail="Invalid user type",
                error_code="AUTH_INVALID_USER_TYPE"
            )
    
    # Private helper methods
    async def _get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email from buyers table."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def _get_developer_by_email(self, email: str) -> Optional[Developer]:
        """Get developer by email from developers table."""
        result = await self.db.execute(
            select(Developer).where(Developer.email == email)
        )
        return result.scalar_one_or_none()
    
    async def _get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID from buyers table."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_developer_by_id(self, developer_id: int) -> Optional[Developer]:
        """Get developer by ID from developers table."""
        result = await self.db.execute(
            select(Developer).where(Developer.id == developer_id)
        )
        return result.scalar_one_or_none() 