from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Union, Tuple
from pydantic import ValidationError

from app.infrastructure import hash_password, verify_password, generate_token
from app.models import User, Developer, UserRole, VerificationStatus
from app.schemas.auth import BuyerRegistrationRequest, DeveloperRegistrationRequest, UserLoginRequest
from app.errors import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    AuthenticationError,
    AccountDisabledError,
    TokenInvalidError,
    UserNotFoundError,
    EmailValidationError,
    PasswordValidationError,
    ErrorMessages
)


class AuthService:
    """Business logic for user authentication and authorization"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_buyer(self, user_data: BuyerRegistrationRequest) -> User:
        """
        Create a new buyer account in the database.
        """
        try:
            # Validate email format (Pydantic validation should catch this, but double-check)
            if not user_data.email or "@" not in user_data.email:
                raise EmailValidationError(user_data.email)
            
            # Check if email already exists in users table
        result = await self.db.execute(
            select(User).where(User.email == user_data.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
                raise EmailAlreadyExistsError(user_data.email)

        # Check if email exists in developers table
        result = await self.db.execute(
            select(Developer).where(Developer.email == user_data.email)
        )
        existing_developer = result.scalar_one_or_none()
        
        if existing_developer:
                raise EmailAlreadyExistsError(user_data.email)

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
            
        except EmailAlreadyExistsError:
            # Re-raise our custom exceptions
            raise
        except EmailValidationError:
            raise
        except Exception as e:
            # Handle unexpected database errors
            await self.db.rollback()
            from app.errors import DatabaseError
            raise DatabaseError(
                operation="user registration",
                original_error=e,
                user_message=ErrorMessages.System.DATABASE_ERROR
            )

    async def register_developer(self, developer_data: DeveloperRegistrationRequest) -> Developer:
        """
        Create a new developer account in the database.
        """
        try:
            # Validate email format (Pydantic validation should catch this, but double-check)
            if not developer_data.email or "@" not in developer_data.email:
                raise EmailValidationError(developer_data.email)
            
            # Check if email already exists in users table
        result = await self.db.execute(
            select(User).where(User.email == developer_data.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
                raise EmailAlreadyExistsError(developer_data.email)

        # Check if email exists in developers table
        result = await self.db.execute(
            select(Developer).where(Developer.email == developer_data.email)
        )
        existing_developer = result.scalar_one_or_none()
        
        if existing_developer:
                raise EmailAlreadyExistsError(developer_data.email)

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
            
        except EmailAlreadyExistsError:
            # Re-raise our custom exceptions
            raise
        except EmailValidationError:
            raise
        except Exception as e:
            # Handle unexpected database errors
            await self.db.rollback()
            from app.errors import DatabaseError
            raise DatabaseError(
                operation="developer registration",
                original_error=e,
                user_message=ErrorMessages.System.DATABASE_ERROR
            )

    async def authenticate_user(self, login_data: UserLoginRequest) -> Tuple[Union[User, Developer], str]:
        """
        Authenticate a user and generate an authorization token if successful.
        """
        try:
            # Validate email format
            if not login_data.email or "@" not in login_data.email:
                raise EmailValidationError(login_data.email)
            
        # Try to find user first
        result = await self.db.execute(
            select(User).where(User.email == login_data.email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            if not verify_password(login_data.password, user.password_hash):
                    raise InvalidCredentialsError(login_data.email)
            
            if not user.is_active:
                    raise AccountDisabledError()
            
            token = generate_token(user.email)
            return user, token

        # Try to find developer
        result = await self.db.execute(
            select(Developer).where(Developer.email == login_data.email)
        )
        developer = result.scalar_one_or_none()
        
        if developer:
            if not verify_password(login_data.password, developer.password_hash):
                    raise InvalidCredentialsError(login_data.email)
            
            token = generate_token(developer.email)
            return developer, token

            # No user found - use same error as incorrect password for security
            raise InvalidCredentialsError(login_data.email)
            
        except (EmailValidationError, InvalidCredentialsError, AccountDisabledError):
            # Re-raise our custom exceptions
            raise
        except Exception as e:
            # Handle unexpected database errors
            from app.errors import DatabaseError
            raise DatabaseError(
                operation="user authentication",
                original_error=e,
                user_message=ErrorMessages.System.DATABASE_ERROR
        )

    async def get_current_user(self, token: str) -> Union[User, Developer]:
        """
        Get current user from JWT token.
        """
        from app.infrastructure import verify_token
        
        try:
            email = verify_token(token)
        except HTTPException:
            raise TokenInvalidError()
        except Exception:
            raise TokenInvalidError()
        
        try:
        # Try to find user first
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            if not user.is_active:
                    raise AccountDisabledError()
            return user
        
        # Try to find developer
        result = await self.db.execute(
            select(Developer).where(Developer.email == email)
        )
        developer = result.scalar_one_or_none()
        
        if developer:
            return developer
        
            # User not found
            raise UserNotFoundError(email)
            
        except (AccountDisabledError, UserNotFoundError):
            # Re-raise our custom exceptions
            raise
        except Exception as e:
            # Handle unexpected database errors
            from app.errors import DatabaseError
            raise DatabaseError(
                operation="user lookup",
                original_error=e,
                user_message=ErrorMessages.System.DATABASE_ERROR
        ) 