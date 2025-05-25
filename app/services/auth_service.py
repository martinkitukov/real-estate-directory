"""
Authentication service implementing business logic for user registration and authentication.
Following Single Responsibility Principle and Dependency Inversion Principle.
"""
from typing import Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import status, HTTPException

from app.db.models import User, Developer, UserRole, VerificationStatus
from app.schemas.auth import (
    BuyerRegistrationRequest, 
    DeveloperRegistrationRequest, 
    UserLoginRequest,
    UserType
)
from app.core.security import PasswordManager, JWTManager, create_user_token_data


class AuthenticationError(HTTPException):
    """Custom exception for authentication errors."""
    
    def __init__(self, detail: str, error_code: str):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )
        self.error_code = error_code


class RegistrationError(HTTPException):
    """Custom exception for registration errors."""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class AuthService:
    """
    Authentication service implementing business logic.
    Following Dependency Inversion - depends on abstractions (AsyncSession interface).
    """
    
    def __init__(self, db: AsyncSession):
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
        
        # Debug: verify the actual role value being used
        role_value = UserRole.BUYER.value
        print(f"DEBUG: Using role value: {repr(role_value)}")
        
        new_user = User(
            email=registration_data.email,
            password_hash=hashed_password,
            first_name=registration_data.first_name,
            last_name=registration_data.last_name,
            role=role_value
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
        Creates both a User record and a Developer record.
        
        Args:
            registration_data: Developer registration information
            
        Returns:
            Created Developer instance
            
        Raises:
            RegistrationError: If email already exists or other validation fails
        """
        # Check if email already exists
        existing_user = await self._get_user_by_email(registration_data.email)
        if existing_user:
            raise RegistrationError("Email already registered")
        
        # Create new user record with DEVELOPER role
        hashed_password = PasswordManager.get_password_hash(registration_data.password)
        
        new_user = User(
            email=registration_data.email,
            password_hash=hashed_password,
            first_name=registration_data.contact_person.split()[0] if registration_data.contact_person else "",
            last_name=" ".join(registration_data.contact_person.split()[1:]) if len(registration_data.contact_person.split()) > 1 else "",
            role=UserRole.DEVELOPER.value
        )
        
        self.db.add(new_user)
        await self.db.flush()  # Get the user ID before creating developer record
        
        # Create developer profile record
        new_developer = Developer(
            user_id=new_user.id,
            company_name=registration_data.company_name,
            contact_person=registration_data.contact_person,
            phone=registration_data.phone,
            address=registration_data.address,
            website=registration_data.website,
            verification_status=VerificationStatus.PENDING
        )
        
        self.db.add(new_developer)
        await self.db.commit()
        await self.db.refresh(new_developer)
        
        return new_developer
    
    async def authenticate_user(
        self, 
        login_data: UserLoginRequest
    ) -> tuple[User, str]:
        """
        Authenticate user and return user instance with JWT token.
        
        Args:
            login_data: Login credentials
            
        Returns:
            Tuple of (user_instance, access_token)
            
        Raises:
            AuthenticationError: If credentials are invalid
        """
        # Find user by email
        user = await self._get_user_by_email(login_data.email)
        
        if not user or not PasswordManager.verify_password(login_data.password, user.password_hash):
            raise AuthenticationError(
                detail="Invalid email or password",
                error_code="AUTH_INVALID_CREDENTIALS"
            )
        
        if not user.is_active:
            raise AuthenticationError(
                detail="Account is deactivated",
                error_code="AUTH_ACCOUNT_DEACTIVATED"
            )
        
        # Determine user type for token
        user_type = self._get_user_type_from_role(user.role)
        
        # For developers, check verification status
        if user.role == UserRole.DEVELOPER:
            developer = await self._get_developer_by_user_id(user.id)
            if developer and developer.verification_status != VerificationStatus.VERIFIED:
                user_type = UserType.UNVERIFIED_DEVELOPER
        
        token_data = create_user_token_data(user.id, user_type)
        access_token = JWTManager.create_access_token(token_data)
        
        return user, access_token
    
    async def get_current_user(
        self, 
        token: str
    ) -> User:
        """
        Get current user from JWT token.
        
        Args:
            token: JWT access token
            
        Returns:
            User instance
            
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
        
        # Get user from database
        user = await self._get_user_by_id(user_id)
        if not user:
            raise AuthenticationError(
                detail="User not found",
                error_code="AUTH_USER_NOT_FOUND"
            )
        
        if not user.is_active:
            raise AuthenticationError(
                detail="Account is deactivated",
                error_code="AUTH_ACCOUNT_DEACTIVATED"
            )
        
        return user
    
    async def get_developer_profile(self, user_id: int) -> Optional[Developer]:
        """Get developer profile for a user."""
        return await self._get_developer_by_user_id(user_id)
    
    # Private helper methods
    async def _get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def _get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_developer_by_user_id(self, user_id: int) -> Optional[Developer]:
        """Get developer profile by user ID."""
        result = await self.db.execute(
            select(Developer).where(Developer.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    def _get_user_type_from_role(self, role: UserRole) -> UserType:
        """Convert database UserRole to API UserType."""
        if role == UserRole.BUYER:
            return UserType.BUYER
        elif role == UserRole.DEVELOPER:
            return UserType.DEVELOPER
        elif role == UserRole.ADMIN:
            return UserType.ADMIN
        else:
            return UserType.BUYER  # Default fallback 