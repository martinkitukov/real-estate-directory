"""
Authentication schemas for request/response validation.
Following Interface Segregation Principle - specific schemas for specific purposes.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from enum import Enum


class UserType(str, Enum):
    """User type enumeration for type safety."""
    BUYER = "buyer"
    DEVELOPER = "developer"
    UNVERIFIED_DEVELOPER = "unverified_developer"
    ADMIN = "admin"


# ==================== Authentication Requests ====================

class UserLoginRequest(BaseModel):
    """Schema for user login requests."""
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class BuyerRegistrationRequest(BaseModel):
    """Schema for buyer registration requests."""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip().title()
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "buyer@example.com",
                "password": "securepass123",
                "first_name": "John",
                "last_name": "Doe"
            }
        }


class DeveloperRegistrationRequest(BaseModel):
    """Schema for developer registration requests."""
    email: EmailStr
    password: str
    company_name: str
    contact_person: str
    phone: str
    address: str
    website: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v
    
    @validator('company_name', 'contact_person')
    def validate_required_fields(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Field must be at least 2 characters long')
        return v.strip()
    
    @validator('phone')
    def validate_phone(cls, v):
        # Basic phone validation - can be enhanced based on requirements
        cleaned = ''.join(filter(str.isdigit, v))
        if len(cleaned) < 10:
            raise ValueError('Phone number must contain at least 10 digits')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "developer@construction.com",
                "password": "securepass123",
                "company_name": "ABC Construction Ltd.",
                "contact_person": "Jane Smith",
                "phone": "+359 88 123 4567",
                "address": "Sofia, Bulgaria",
                "website": "https://abc-construction.com"
            }
        }


# ==================== Authentication Responses ====================

class TokenResponse(BaseModel):
    """Schema for JWT token responses."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user_type: UserType
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user_type": "buyer"
            }
        }


class UserProfileResponse(BaseModel):
    """Base schema for user profile responses."""
    id: int
    email: str
    user_type: UserType
    created_at: str
    
    class Config:
        from_attributes = True


class BuyerProfileResponse(UserProfileResponse):
    """Schema for buyer profile responses."""
    first_name: str
    last_name: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "buyer@example.com",
                "user_type": "buyer",
                "first_name": "John",
                "last_name": "Doe",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }


class DeveloperProfileResponse(UserProfileResponse):
    """Schema for developer profile responses."""
    company_name: str
    contact_person: str
    phone: str
    address: str
    website: Optional[str]
    verification_status: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "developer@construction.com",
                "user_type": "developer",
                "company_name": "ABC Construction Ltd.",
                "contact_person": "Jane Smith",
                "phone": "+359 88 123 4567",
                "address": "Sofia, Bulgaria",
                "website": "https://abc-construction.com",
                "verification_status": "verified",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }


# ==================== Error Responses ====================

class AuthErrorResponse(BaseModel):
    """Schema for authentication error responses."""
    detail: str
    error_code: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid email or password",
                "error_code": "AUTH_INVALID_CREDENTIALS"
            }
        }


class ValidationErrorResponse(BaseModel):
    """Schema for validation error responses."""
    detail: str
    field_errors: Optional[dict] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Validation failed",
                "field_errors": {
                    "password": ["Password must be at least 8 characters long"]
                }
            }
        } 