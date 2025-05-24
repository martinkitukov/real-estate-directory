"""
RESTful Authentication API routes.
Following REST principles with proper HTTP methods and status codes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import User, Developer
from app.services.auth_service import AuthService, AuthenticationError, RegistrationError
from app.schemas.auth import (
    BuyerRegistrationRequest,
    DeveloperRegistrationRequest,
    UserLoginRequest,
    TokenResponse,
    BuyerProfileResponse,
    DeveloperProfileResponse,
    AuthErrorResponse,
    UserType
)
from app.core.dependencies import (
    get_current_user,
    get_current_buyer,
    get_current_developer,
    get_current_unverified_developer,
    get_auth_service
)
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ==================== Registration Endpoints ====================

@router.post(
    "/register/buyer",
    response_model=BuyerProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new buyer",
    description="Create a new buyer account with email and password validation.",
    responses={
        201: {"description": "Buyer successfully registered"},
        400: {"model": AuthErrorResponse, "description": "Registration failed - validation error or email already exists"},
        422: {"description": "Invalid input data"}
    }
)
async def register_buyer(
    registration_data: BuyerRegistrationRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> BuyerProfileResponse:
    """
    Register a new buyer account.
    
    **RESTful Design:**
    - POST method for resource creation
    - 201 status code for successful creation
    - Returns created resource representation
    """
    try:
        new_user = await auth_service.register_buyer(registration_data)
        
        return BuyerProfileResponse(
            id=new_user.id,
            email=new_user.email,
            user_type=UserType.BUYER,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            created_at=new_user.created_at.isoformat()
        )
        
    except RegistrationError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        )


@router.post(
    "/register/developer",
    response_model=DeveloperProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new developer",
    description="Create a new developer account. Account will be pending verification.",
    responses={
        201: {"description": "Developer successfully registered"},
        400: {"model": AuthErrorResponse, "description": "Registration failed - validation error or email already exists"},
        422: {"description": "Invalid input data"}
    }
)
async def register_developer(
    registration_data: DeveloperRegistrationRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> DeveloperProfileResponse:
    """
    Register a new developer account.
    
    **RESTful Design:**
    - POST method for resource creation
    - 201 status code for successful creation
    - Returns created resource representation
    """
    try:
        new_developer = await auth_service.register_developer(registration_data)
        
        return DeveloperProfileResponse(
            id=new_developer.id,
            email=new_developer.email,
            user_type=UserType.UNVERIFIED_DEVELOPER,
            company_name=new_developer.company_name,
            contact_person=new_developer.contact_person,
            phone=new_developer.phone,
            address=new_developer.address,
            website=new_developer.website,
            verification_status=new_developer.verification_status,
            created_at=new_developer.created_at.isoformat()
        )
        
    except RegistrationError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail
        )


# ==================== Authentication Endpoints ====================

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate user and return JWT access token.",
    responses={
        200: {"description": "Successfully authenticated"},
        401: {"model": AuthErrorResponse, "description": "Invalid credentials"},
        422: {"description": "Invalid input data"}
    }
)
async def login(
    login_data: UserLoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> TokenResponse:
    """
    Authenticate user and return JWT token.
    
    **RESTful Design:**
    - POST method for authentication action
    - 200 status code for successful authentication
    - Returns token for subsequent API calls
    """
    try:
        user, access_token = await auth_service.authenticate_user(login_data)
        
        # Determine user type for response
        if isinstance(user, User):
            user_type = UserType.BUYER
        elif isinstance(user, Developer):
            user_type = (
                UserType.DEVELOPER if user.verification_status == "verified"
                else UserType.UNVERIFIED_DEVELOPER
            )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
            user_type=user_type
        )
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.detail,
            headers=e.headers
        )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="User logout",
    description="Logout user (client should discard token).",
    responses={
        204: {"description": "Successfully logged out"},
        401: {"description": "Not authenticated"}
    }
)
async def logout(
    current_user: User | Developer = Depends(get_current_user)
):
    """
    Logout user.
    
    **RESTful Design:**
    - POST method for logout action
    - 204 status code (no content) as no data is returned
    - JWT is stateless, so client just discards the token
    
    Note: In a stateless JWT system, logout is handled client-side.
    For server-side logout, implement token blacklisting if needed.
    """
    return JSONResponse(
        status_code=status.HTTP_204_NO_CONTENT,
        content=None
    )


# ==================== Profile Endpoints ====================

@router.get(
    "/profile",
    response_model=BuyerProfileResponse | DeveloperProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieve the authenticated user's profile information.",
    responses={
        200: {"description": "Profile retrieved successfully"},
        401: {"description": "Not authenticated"},
        404: {"description": "User not found"}
    }
)
async def get_profile(
    current_user: User | Developer = Depends(get_current_user)
) -> BuyerProfileResponse | DeveloperProfileResponse:
    """
    Get current user's profile.
    
    **RESTful Design:**
    - GET method for resource retrieval
    - 200 status code for successful retrieval
    - Returns user resource representation
    """
    if isinstance(current_user, User):
        return BuyerProfileResponse(
            id=current_user.id,
            email=current_user.email,
            user_type=UserType.BUYER,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            created_at=current_user.created_at.isoformat()
        )
    
    elif isinstance(current_user, Developer):
        user_type = (
            UserType.DEVELOPER if current_user.verification_status == "verified"
            else UserType.UNVERIFIED_DEVELOPER
        )
        
        return DeveloperProfileResponse(
            id=current_user.id,
            email=current_user.email,
            user_type=user_type,
            company_name=current_user.company_name,
            contact_person=current_user.contact_person,
            phone=current_user.phone,
            address=current_user.address,
            website=current_user.website,
            verification_status=current_user.verification_status,
            created_at=current_user.created_at.isoformat()
        )


# ==================== Role-specific Endpoints (Examples) ====================

@router.get(
    "/profile/buyer",
    response_model=BuyerProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get buyer profile",
    description="Retrieve buyer-specific profile. Requires buyer authentication.",
    responses={
        200: {"description": "Buyer profile retrieved successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied - buyer account required"}
    }
)
async def get_buyer_profile(
    current_buyer: User = Depends(get_current_buyer)
) -> BuyerProfileResponse:
    """
    Get buyer-specific profile.
    
    **RESTful Design:**
    - GET method for resource retrieval
    - Role-based access control
    - Clear resource naming (/buyer)
    """
    return BuyerProfileResponse(
        id=current_buyer.id,
        email=current_buyer.email,
        user_type=UserType.BUYER,
        first_name=current_buyer.first_name,
        last_name=current_buyer.last_name,
        created_at=current_buyer.created_at.isoformat()
    )


@router.get(
    "/profile/developer",
    response_model=DeveloperProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get developer profile",
    description="Retrieve developer-specific profile. Requires verified developer authentication.",
    responses={
        200: {"description": "Developer profile retrieved successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied - verified developer account required"}
    }
)
async def get_developer_profile(
    current_developer: Developer = Depends(get_current_developer)
) -> DeveloperProfileResponse:
    """
    Get verified developer-specific profile.
    
    **RESTful Design:**
    - GET method for resource retrieval
    - Role-based access control
    - Clear resource naming (/developer)
    """
    return DeveloperProfileResponse(
        id=current_developer.id,
        email=current_developer.email,
        user_type=UserType.DEVELOPER,
        company_name=current_developer.company_name,
        contact_person=current_developer.contact_person,
        phone=current_developer.phone,
        address=current_developer.address,
        website=current_developer.website,
        verification_status=current_developer.verification_status,
        created_at=current_developer.created_at.isoformat()
    ) 