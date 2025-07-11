"""
Error message constants for the real estate directory application.

Following Single Responsibility Principle (SRP) - this module only handles error message definitions.
All error messages are centralized here for consistency and maintainability.
"""

from enum import Enum
from typing import Dict, Any


class ErrorCodes(Enum):
    """HTTP status codes for different error types."""
    
    # Validation errors (400)
    VALIDATION_ERROR = 400
    
    # Authentication errors (401)
    INVALID_CREDENTIALS = 401
    TOKEN_EXPIRED = 401
    TOKEN_INVALID = 401
    
    # Authorization errors (403)  
    INSUFFICIENT_PERMISSIONS = 403
    ACCOUNT_DISABLED = 403
    
    # Not found errors (404)
    RESOURCE_NOT_FOUND = 404
    
    # Conflict errors (409)
    EMAIL_ALREADY_EXISTS = 409
    RESOURCE_ALREADY_EXISTS = 409
    
    # Internal server errors (500)
    INTERNAL_SERVER_ERROR = 500
    DATABASE_ERROR = 500


class ErrorMessages:
    """
    Centralized error messages organized by domain.
    
    Following Open/Closed Principle (OCP) - easy to extend with new domains
    without modifying existing code.
    """
    
    # Authentication & Authorization Messages
    class Auth:
        INVALID_CREDENTIALS = "Invalid email or password. Please check your credentials and try again."
        EMAIL_NOT_FOUND = "No account found with this email address."
        INCORRECT_PASSWORD = "The password you entered is incorrect."
        TOKEN_EXPIRED = "Your session has expired. Please log in again."
        TOKEN_INVALID = "Invalid authentication token. Please log in again."
        INSUFFICIENT_PERMISSIONS = "You don't have permission to access this resource."
        ACCOUNT_DISABLED = "Your account has been disabled. Please contact support."
        LOGOUT_SUCCESS = "You have been successfully logged out."
        
    # Validation Messages
    class Validation:
        REQUIRED_FIELD = "This field is required."
        INVALID_EMAIL = "Please enter a valid email address."
        INVALID_EMAIL_FORMAT = "Email must be in a valid format (e.g., user@example.com)."
        PASSWORD_TOO_SHORT = "Password must be at least 8 characters long."
        PASSWORD_TOO_WEAK = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        INVALID_PHONE = "Please enter a valid phone number."
        INVALID_URL = "Please enter a valid URL."
        INVALID_DATE = "Please enter a valid date."
        INVALID_ENUM_VALUE = "Please select a valid option from the available choices."
        
    # User Management Messages
    class User:
        EMAIL_ALREADY_EXISTS = "An account with this email address already exists."
        USER_NOT_FOUND = "User not found."
        USER_CREATED_SUCCESS = "Account created successfully! You can now log in."
        PROFILE_UPDATED_SUCCESS = "Your profile has been updated successfully."
        
    # Developer Messages
    class Developer:
        COMPANY_NAME_REQUIRED = "Company name is required for developer registration."
        CONTACT_PERSON_REQUIRED = "Contact person name is required."
        DEVELOPER_NOT_FOUND = "Developer not found."
        DEVELOPER_ALREADY_VERIFIED = "This developer account is already verified."
        VERIFICATION_PENDING = "Your developer account is pending verification."
        VERIFICATION_REJECTED = "Your developer verification has been rejected. Please contact support."
        
    # Project Messages  
    class Project:
        PROJECT_NOT_FOUND = "Project not found."
        PROJECT_TITLE_REQUIRED = "Project title is required."
        PROJECT_DESCRIPTION_REQUIRED = "Project description is required."
        PROJECT_LOCATION_REQUIRED = "Project location is required."
        INVALID_PROJECT_STATUS = "Please select a valid project status."
        INVALID_PROJECT_TYPE = "Please select a valid project type."
        PROJECT_CREATED_SUCCESS = "Project created successfully!"
        PROJECT_UPDATED_SUCCESS = "Project updated successfully!"
        PROJECT_DELETED_SUCCESS = "Project deleted successfully!"
        UNAUTHORIZED_PROJECT_ACCESS = "You don't have permission to access this project."
        
    # General System Messages
    class System:
        INTERNAL_ERROR = "An unexpected error occurred. Please try again later."
        DATABASE_ERROR = "Database connection error. Please try again later."
        NETWORK_ERROR = "Network connection error. Please check your internet connection."
        SERVICE_UNAVAILABLE = "Service temporarily unavailable. Please try again later."
        INVALID_REQUEST = "Invalid request format."
        RATE_LIMIT_EXCEEDED = "Too many requests. Please try again later."
        
    # File Upload Messages
    class FileUpload:
        FILE_TOO_LARGE = "File size exceeds the maximum limit of {max_size}MB."
        INVALID_FILE_TYPE = "Invalid file type. Allowed types: {allowed_types}."
        UPLOAD_FAILED = "File upload failed. Please try again."
        FILE_NOT_FOUND = "File not found."
        
    # Business Logic Messages
    class Business:
        SUBSCRIPTION_EXPIRED = "Your subscription has expired. Please renew to continue."
        SUBSCRIPTION_REQUIRED = "This feature requires an active subscription."
        QUOTA_EXCEEDED = "You have exceeded your usage quota for this feature."
        FEATURE_NOT_AVAILABLE = "This feature is not available in your current plan."


class ErrorDetails:
    """
    Detailed error information for debugging and logging.
    
    Following Interface Segregation Principle (ISP) - specific error details
    separated from user-facing messages.
    """
    
    @staticmethod
    def validation_error(field: str, value: Any, message: str) -> Dict[str, Any]:
        """Create detailed validation error information."""
        return {
            "error_type": "validation_error",
            "field": field,
            "value": str(value) if value is not None else None,
            "message": message,
            "code": ErrorCodes.VALIDATION_ERROR.value
        }
    
    @staticmethod
    def authentication_error(message: str, error_code: ErrorCodes = ErrorCodes.INVALID_CREDENTIALS) -> Dict[str, Any]:
        """Create detailed authentication error information."""
        return {
            "error_type": "authentication_error",
            "message": message,
            "code": error_code.value
        }
    
    @staticmethod
    def authorization_error(resource: str, action: str) -> Dict[str, Any]:
        """Create detailed authorization error information."""
        return {
            "error_type": "authorization_error",
            "resource": resource,
            "action": action,
            "message": ErrorMessages.Auth.INSUFFICIENT_PERMISSIONS,
            "code": ErrorCodes.INSUFFICIENT_PERMISSIONS.value
        }
    
    @staticmethod
    def not_found_error(resource: str, identifier: str) -> Dict[str, Any]:
        """Create detailed not found error information."""
        return {
            "error_type": "not_found_error",
            "resource": resource,
            "identifier": identifier,
            "message": f"{resource.title()} not found.",
            "code": ErrorCodes.RESOURCE_NOT_FOUND.value
        }
    
    @staticmethod
    def conflict_error(resource: str, field: str, value: str) -> Dict[str, Any]:
        """Create detailed conflict error information."""
        return {
            "error_type": "conflict_error",
            "resource": resource,
            "field": field,
            "value": value,
            "message": f"{resource.title()} with this {field} already exists.",
            "code": ErrorCodes.RESOURCE_ALREADY_EXISTS.value
        } 