"""
Custom exception classes for the real estate directory application.

Following Liskov Substitution Principle (LSP) - all custom exceptions can be 
used interchangeably with their base Exception class.
Following Dependency Inversion Principle (DIP) - depends on abstractions (base Exception).
"""

from typing import Any, Dict, Optional, List
from .constants import ErrorCodes, ErrorMessages, ErrorDetails


class BaseAppException(Exception):
    """
    Base exception class for all application-specific exceptions.
    
    Following Single Responsibility Principle (SRP) - handles common exception behavior.
    """
    
    def __init__(
        self,
        message: str,
        error_code: ErrorCodes,
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.user_message = user_message or message
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API responses."""
        return {
            "error": True,
            "message": self.user_message,
            "error_code": self.error_code.value,
            "error_type": self.__class__.__name__,
            "details": self.details
        }
    
    @property
    def status_code(self) -> int:
        """Get HTTP status code for this exception."""
        return self.error_code.value


class ValidationError(BaseAppException):
    """
    Exception for validation errors.
    
    Raised when input data doesn't meet validation requirements.
    """
    
    def __init__(
        self,
        message: str = ErrorMessages.Validation.REQUIRED_FIELD,
        field: Optional[str] = None,
        value: Any = None,
        user_message: Optional[str] = None
    ):
        details = ErrorDetails.validation_error(
            field=field or "unknown",
            value=value,
            message=message
        )
        super().__init__(
            message=message,
            error_code=ErrorCodes.VALIDATION_ERROR,
            details=details,
            user_message=user_message or message
        )


class EmailValidationError(ValidationError):
    """Specific validation error for email fields."""
    
    def __init__(self, email: str, user_message: Optional[str] = None):
        super().__init__(
            message=ErrorMessages.Validation.INVALID_EMAIL_FORMAT,
            field="email",
            value=email,
            user_message=user_message or ErrorMessages.Validation.INVALID_EMAIL_FORMAT
        )


class PasswordValidationError(ValidationError):
    """Specific validation error for password fields."""
    
    def __init__(self, reason: str = "weak", user_message: Optional[str] = None):
        message = (
            ErrorMessages.Validation.PASSWORD_TOO_SHORT 
            if reason == "short" 
            else ErrorMessages.Validation.PASSWORD_TOO_WEAK
        )
        super().__init__(
            message=message,
            field="password",
            value="[REDACTED]",
            user_message=user_message or message
        )


class AuthenticationError(BaseAppException):
    """
    Exception for authentication failures.
    
    Raised when user credentials are invalid or authentication fails.
    """
    
    def __init__(
        self,
        message: str = ErrorMessages.Auth.INVALID_CREDENTIALS,
        error_code: ErrorCodes = ErrorCodes.INVALID_CREDENTIALS,
        user_message: Optional[str] = None
    ):
        details = ErrorDetails.authentication_error(message, error_code)
        super().__init__(
            message=message,
            error_code=error_code,
            details=details,
            user_message=user_message or ErrorMessages.Auth.INVALID_CREDENTIALS
        )


class InvalidCredentialsError(AuthenticationError):
    """Specific authentication error for invalid login credentials."""
    
    def __init__(self, email: Optional[str] = None):
        super().__init__(
            message=ErrorMessages.Auth.INVALID_CREDENTIALS,
            error_code=ErrorCodes.INVALID_CREDENTIALS,
            user_message=ErrorMessages.Auth.INVALID_CREDENTIALS
        )
        if email:
            self.details["email"] = email


class TokenExpiredError(AuthenticationError):
    """Specific authentication error for expired tokens."""
    
    def __init__(self):
        super().__init__(
            message=ErrorMessages.Auth.TOKEN_EXPIRED,
            error_code=ErrorCodes.TOKEN_EXPIRED,
            user_message=ErrorMessages.Auth.TOKEN_EXPIRED
        )


class TokenInvalidError(AuthenticationError):
    """Specific authentication error for invalid tokens."""
    
    def __init__(self):
        super().__init__(
            message=ErrorMessages.Auth.TOKEN_INVALID,
            error_code=ErrorCodes.TOKEN_INVALID,
            user_message=ErrorMessages.Auth.TOKEN_INVALID
        )


class AuthorizationError(BaseAppException):
    """
    Exception for authorization failures.
    
    Raised when user doesn't have permission to perform an action.
    """
    
    def __init__(
        self,
        resource: str,
        action: str,
        user_message: Optional[str] = None
    ):
        details = ErrorDetails.authorization_error(resource, action)
        super().__init__(
            message=f"Insufficient permissions to {action} {resource}",
            error_code=ErrorCodes.INSUFFICIENT_PERMISSIONS,
            details=details,
            user_message=user_message or ErrorMessages.Auth.INSUFFICIENT_PERMISSIONS
        )


class AccountDisabledError(AuthorizationError):
    """Specific authorization error for disabled accounts."""
    
    def __init__(self):
        super().__init__(
            resource="account",
            action="access",
            user_message=ErrorMessages.Auth.ACCOUNT_DISABLED
        )
        self.error_code = ErrorCodes.ACCOUNT_DISABLED


class NotFoundError(BaseAppException):
    """
    Exception for resource not found errors.
    
    Raised when a requested resource doesn't exist.
    """
    
    def __init__(
        self,
        resource: str,
        identifier: str,
        user_message: Optional[str] = None
    ):
        details = ErrorDetails.not_found_error(resource, identifier)
        message = f"{resource.title()} with ID '{identifier}' not found"
        super().__init__(
            message=message,
            error_code=ErrorCodes.RESOURCE_NOT_FOUND,
            details=details,
            user_message=user_message or f"{resource.title()} not found."
        )


class UserNotFoundError(NotFoundError):
    """Specific not found error for users."""
    
    def __init__(self, identifier: str):
        super().__init__(
            resource="user",
            identifier=identifier,
            user_message=ErrorMessages.User.USER_NOT_FOUND
        )


class DeveloperNotFoundError(NotFoundError):
    """Specific not found error for developers."""
    
    def __init__(self, identifier: str):
        super().__init__(
            resource="developer",
            identifier=identifier,
            user_message=ErrorMessages.Developer.DEVELOPER_NOT_FOUND
        )


class ProjectNotFoundError(NotFoundError):
    """Specific not found error for projects."""
    
    def __init__(self, identifier: str):
        super().__init__(
            resource="project",
            identifier=identifier,
            user_message=ErrorMessages.Project.PROJECT_NOT_FOUND
        )


class ConflictError(BaseAppException):
    """
    Exception for resource conflict errors.
    
    Raised when attempting to create a resource that already exists.
    """
    
    def __init__(
        self,
        resource: str,
        field: str,
        value: str,
        user_message: Optional[str] = None
    ):
        details = ErrorDetails.conflict_error(resource, field, value)
        message = f"{resource.title()} with {field} '{value}' already exists"
        super().__init__(
            message=message,
            error_code=ErrorCodes.RESOURCE_ALREADY_EXISTS,
            details=details,
            user_message=user_message or f"{resource.title()} already exists."
        )


class EmailAlreadyExistsError(ConflictError):
    """Specific conflict error for duplicate email addresses."""
    
    def __init__(self, email: str):
        super().__init__(
            resource="user",
            field="email",
            value=email,
            user_message=ErrorMessages.User.EMAIL_ALREADY_EXISTS
        )
        self.error_code = ErrorCodes.EMAIL_ALREADY_EXISTS


class BusinessLogicError(BaseAppException):
    """
    Exception for business logic violations.
    
    Raised when an operation violates business rules.
    """
    
    def __init__(
        self,
        message: str,
        business_rule: str,
        user_message: Optional[str] = None
    ):
        details = {
            "business_rule": business_rule,
            "violation": message
        }
        super().__init__(
            message=message,
            error_code=ErrorCodes.VALIDATION_ERROR,
            details=details,
            user_message=user_message or message
        )


class DatabaseError(BaseAppException):
    """
    Exception for database-related errors.
    
    Raised when database operations fail.
    """
    
    def __init__(
        self,
        operation: str,
        original_error: Optional[Exception] = None,
        user_message: Optional[str] = None
    ):
        message = f"Database error during {operation}"
        details = {
            "operation": operation,
            "original_error": str(original_error) if original_error else None
        }
        super().__init__(
            message=message,
            error_code=ErrorCodes.DATABASE_ERROR,
            details=details,
            user_message=user_message or ErrorMessages.System.DATABASE_ERROR
        )


class ExternalServiceError(BaseAppException):
    """
    Exception for external service failures.
    
    Raised when external service calls fail.
    """
    
    def __init__(
        self,
        service: str,
        operation: str,
        original_error: Optional[Exception] = None,
        user_message: Optional[str] = None
    ):
        message = f"External service '{service}' error during {operation}"
        details = {
            "service": service,
            "operation": operation,
            "original_error": str(original_error) if original_error else None
        }
        super().__init__(
            message=message,
            error_code=ErrorCodes.INTERNAL_SERVER_ERROR,
            details=details,
            user_message=user_message or ErrorMessages.System.SERVICE_UNAVAILABLE
        ) 