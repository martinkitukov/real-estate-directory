"""
Error handling module for the real estate directory application.

This module provides centralized error handling with:
- Error message constants
- Custom exception classes  
- Error handlers
- Following SOLID principles for separation of concerns
"""

from .constants import ErrorMessages, ErrorCodes
from .exceptions import (
    BaseAppException,
    ValidationError,
    EmailValidationError,
    PasswordValidationError,
    AuthenticationError,
    InvalidCredentialsError,
    TokenExpiredError,
    TokenInvalidError,
    AuthorizationError,
    AccountDisabledError,
    NotFoundError,
    UserNotFoundError,
    DeveloperNotFoundError,
    ProjectNotFoundError,
    ConflictError,
    EmailAlreadyExistsError,
    BusinessLogicError,
    DatabaseError,
    ExternalServiceError
)
from .handlers import setup_error_handlers

__all__ = [
    "ErrorMessages",
    "ErrorCodes",
    "BaseAppException", 
    "ValidationError",
    "EmailValidationError",
    "PasswordValidationError",
    "AuthenticationError",
    "InvalidCredentialsError",
    "TokenExpiredError",
    "TokenInvalidError",
    "AuthorizationError",
    "AccountDisabledError",
    "NotFoundError",
    "UserNotFoundError",
    "DeveloperNotFoundError",
    "ProjectNotFoundError",
    "ConflictError",
    "EmailAlreadyExistsError",
    "BusinessLogicError",
    "DatabaseError",
    "ExternalServiceError",
    "setup_error_handlers"
] 