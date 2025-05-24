"""
FastAPI dependencies for authentication and authorization.
Following Dependency Inversion Principle.
"""
from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import User, Developer
from app.services.auth_service import AuthService, AuthenticationError
from app.schemas.auth import UserType

# Security scheme for JWT token extraction
security = HTTPBearer()


class RequireUserType:
    """
    Dependency class to enforce user type requirements.
    Following Open/Closed Principle - can be extended with new user types.
    """
    
    def __init__(self, allowed_types: list[UserType]):
        self.allowed_types = allowed_types
    
    def __call__(
        self, 
        current_user: Union[User, Developer] = Depends(get_current_user)
    ):
        # Determine user type from the user instance
        if isinstance(current_user, User):
            user_type = UserType.BUYER
        elif isinstance(current_user, Developer):
            if current_user.verification_status == "verified":
                user_type = UserType.DEVELOPER
            else:
                user_type = UserType.UNVERIFIED_DEVELOPER
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid user type"
            )
        
        if user_type not in self.allowed_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required user types: {[ut.value for ut in self.allowed_types]}"
            )
        
        return current_user


# Dependency functions
def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """
    Get authentication service instance.
    Dependency Inversion: Depends on abstraction (AsyncSession).
    """
    return AuthService(db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> Union[User, Developer]:
    """
    Get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer token credentials
        auth_service: Authentication service instance
        
    Returns:
        Current authenticated user (User or Developer)
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        return await auth_service.get_current_user(credentials.credentials)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
            headers=e.headers
        )


async def get_current_buyer(
    current_user: Union[User, Developer] = Depends(get_current_user)
) -> User:
    """
    Get current user, ensuring they are a buyer.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current buyer user
        
    Raises:
        HTTPException: If user is not a buyer
    """
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Buyer account required."
        )
    return current_user


async def get_current_developer(
    current_user: Union[User, Developer] = Depends(get_current_user)
) -> Developer:
    """
    Get current user, ensuring they are a verified developer.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current verified developer
        
    Raises:
        HTTPException: If user is not a verified developer
    """
    if not isinstance(current_user, Developer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer account required."
        )
    
    if current_user.verification_status != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer account verification required."
        )
    
    return current_user


async def get_current_unverified_developer(
    current_user: Union[User, Developer] = Depends(get_current_user)
) -> Developer:
    """
    Get current user, ensuring they are a developer (verified or unverified).
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current developer (any verification status)
        
    Raises:
        HTTPException: If user is not a developer
    """
    if not isinstance(current_user, Developer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer account required."
        )
    
    return current_user


# Pre-configured dependency instances for common use cases
require_buyer = RequireUserType([UserType.BUYER])
require_developer = RequireUserType([UserType.DEVELOPER])
require_any_developer = RequireUserType([UserType.DEVELOPER, UserType.UNVERIFIED_DEVELOPER])
require_authenticated = RequireUserType([
    UserType.BUYER, 
    UserType.DEVELOPER, 
    UserType.UNVERIFIED_DEVELOPER
]) 