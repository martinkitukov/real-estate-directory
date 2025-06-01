from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure import get_db, verify_token, invalid_credentials, deactivated_user, blocked_user, pending_user
from app.models import User, Developer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_valid_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> Union[User, Developer]:
    """
    Returns an instance of User or Developer if the token is valid and the account is not deactivated.
    """
    email = verify_token(token)
    
    # Try to find user first
    result = await db.execute(
        "SELECT * FROM users WHERE email = :email",
        {"email": email}
    )
    user = result.fetchone()
    
    if user:
        user_obj = User(**dict(user))
        if not user_obj.is_active:
            raise deactivated_user
        return user_obj
    
    # Try to find developer
    result = await db.execute(
        "SELECT * FROM developers WHERE email = :email",
        {"email": email}
    )
    developer = result.fetchone()
    
    if developer:
        developer_obj = Developer(**dict(developer))
        return developer_obj
    
    raise invalid_credentials

async def get_current_user(user: Union[User, Developer] = Depends(get_valid_user)):
    """
    Return an instance of User or Developer - the currently logged-in user.
    """
    return user

async def get_current_buyer(user: Union[User, Developer] = Depends(get_valid_user)):
    """
    Return an instance of User - the currently logged-in buyer.
    """
    if not isinstance(user, User):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Buyer account required."
        )
    return user

async def get_current_developer(user: Union[User, Developer] = Depends(get_valid_user)):
    """
    Return an instance of Developer - the currently logged-in verified developer.
    """
    if not isinstance(user, Developer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer account required."
        )
    
    if user.verification_status != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer account verification required."
        )
    
    return user

async def get_current_unverified_developer(user: Union[User, Developer] = Depends(get_valid_user)):
    """
    Return an instance of Developer - the currently logged-in developer (any verification status).
    """
    if not isinstance(user, Developer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Developer account required."
        )
    
    return user 