from typing import Union
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure import get_db
from app.business import AuthService
from app.models import User, Developer
from app.schemas.auth import (
    BuyerRegistrationRequest,
    DeveloperRegistrationRequest,
    UserLoginRequest,
    TokenResponse,
    BuyerProfileResponse,
    DeveloperProfileResponse,
    UserType
)
from app.dependencies import get_current_user, get_current_buyer, get_current_developer, get_current_unverified_developer
from app.core.config import settings

router = APIRouter(tags=["Authentication"])


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Get authentication service instance."""
    return AuthService(db)


@router.post("/register/buyer", response_model=BuyerProfileResponse, status_code=status.HTTP_201_CREATED)
async def register_buyer(
    registration_data: BuyerRegistrationRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> BuyerProfileResponse:
    """Register a new buyer account."""
        new_user = await auth_service.register_buyer(registration_data)
        
        return BuyerProfileResponse(
            id=new_user.id,
            email=new_user.email,
            user_type=UserType.BUYER,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            created_at=new_user.created_at.isoformat()
        )


@router.post("/register/developer", response_model=DeveloperProfileResponse, status_code=status.HTTP_201_CREATED)
async def register_developer(
    registration_data: DeveloperRegistrationRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> DeveloperProfileResponse:
    """Register a new developer account."""
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


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
) -> TokenResponse:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
        # Create UserLoginRequest from OAuth2PasswordRequestForm
        login_data = UserLoginRequest(
            email=form_data.username,  # OAuth2 uses username field for email
            password=form_data.password
        )
        
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


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
) -> TokenResponse:
    """Alternative login endpoint using JSON body instead of form data."""
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


@router.get("/me", response_model=Union[BuyerProfileResponse, DeveloperProfileResponse])
async def get_current_user_profile(
    current_user: Union[User, Developer] = Depends(get_current_user)
) -> Union[BuyerProfileResponse, DeveloperProfileResponse]:
    """Get current user profile."""
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


@router.get("/profile/buyer", response_model=BuyerProfileResponse)
async def get_buyer_profile(
    current_buyer: User = Depends(get_current_buyer)
) -> BuyerProfileResponse:
    """Get buyer profile - requires buyer authentication."""
    return BuyerProfileResponse(
        id=current_buyer.id,
        email=current_buyer.email,
        user_type=UserType.BUYER,
        first_name=current_buyer.first_name,
        last_name=current_buyer.last_name,
        created_at=current_buyer.created_at.isoformat()
    )


@router.get("/profile/developer", response_model=DeveloperProfileResponse)
async def get_developer_profile(
    current_developer: Developer = Depends(get_current_developer)
) -> DeveloperProfileResponse:
    """Get developer profile - requires verified developer authentication."""
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