"""
Security utilities for authentication and authorization.
Following Single Responsibility Principle - each function has one clear purpose.
"""
from datetime import datetime, timedelta
from typing import Union, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context - Single Responsibility: Password operations only
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordManager:
    """
    Single Responsibility: Handle all password-related operations.
    """
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate hash for a password."""
        return pwd_context.hash(password)


class JWTManager:
    """
    Single Responsibility: Handle all JWT token operations.
    """
    
    @staticmethod
    def create_access_token(
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a new JWT access token."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """
        Verify and decode a JWT token.
        Returns payload if valid, None if invalid.
        """
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def extract_user_data_from_token(token: str) -> Optional[dict]:
        """
        Extract user data from token payload.
        Returns user info if token is valid, None otherwise.
        """
        payload = JWTManager.verify_token(token)
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        user_type: str = payload.get("user_type")
        
        if user_id is None or user_type is None:
            return None
            
        return {
            "user_id": int(user_id),
            "user_type": user_type,
            "exp": payload.get("exp")
        }


def create_user_token_data(user_id: int, user_type: str) -> dict:
    """
    Create token data payload for a user.
    
    Args:
        user_id: User's database ID
        user_type: Type of user (buyer, developer, admin)
    
    Returns:
        Dictionary containing token payload data
    """
    return {
        "sub": str(user_id),
        "user_type": user_type,
        "iat": datetime.utcnow()
    } 