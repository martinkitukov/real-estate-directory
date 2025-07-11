"""
Error handlers for FastAPI application.

Following Single Responsibility Principle (SRP) - each handler handles one type of error.
Following Open/Closed Principle (OCP) - easy to add new error handlers without modifying existing ones.
"""

import logging
from typing import Dict, Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError as PydanticValidationError

from .exceptions import (
    BaseAppException,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    EmailValidationError
)
from .constants import ErrorMessages, ErrorCodes


# Setup logging
logger = logging.getLogger(__name__)


class ErrorResponseBuilder:
    """
    Builder class for creating consistent error responses.
    
    Following Single Responsibility Principle (SRP) - only responsible for building error responses.
    """
    
    @staticmethod
    def build_error_response(
        message: str,
        status_code: int,
        error_type: str = "error",
        details: Dict[str, Any] = None,
        field_errors: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Build a standardized error response."""
        response = {
            "error": True,
            "message": message,
            "error_type": error_type,
            "status_code": status_code
        }
        
        if details:
            response["details"] = details
            
        if field_errors:
            response["field_errors"] = field_errors
            
        return response
    
    @staticmethod
    def build_validation_error_response(
        errors: list,
        message: str = ErrorMessages.System.INVALID_REQUEST
    ) -> Dict[str, Any]:
        """Build a response for validation errors with field-specific messages."""
        field_errors = {}
        
        for error in errors:
            field_path = ".".join(str(loc) for loc in error["loc"])
            error_msg = error["msg"]
            
            # Map common validation errors to user-friendly messages
            if "email" in error_msg.lower():
                error_msg = ErrorMessages.Validation.INVALID_EMAIL_FORMAT
            elif "required" in error_msg.lower():
                error_msg = ErrorMessages.Validation.REQUIRED_FIELD
            elif "string too short" in error_msg.lower():
                if "password" in field_path.lower():
                    error_msg = ErrorMessages.Validation.PASSWORD_TOO_SHORT
                else:
                    error_msg = f"This field is too short."
            
            field_errors[field_path] = error_msg
        
        return ErrorResponseBuilder.build_error_response(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_type="validation_error",
            field_errors=field_errors
        )


async def base_app_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """
    Handler for all custom application exceptions.
    
    This is the main handler that processes all our custom exceptions.
    """
    logger.error(f"Application error: {exc.message}", extra={
        "error_type": exc.__class__.__name__,
        "error_code": exc.error_code.value,
        "details": exc.details,
        "path": request.url.path,
        "method": request.method
    })
    
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handler for FastAPI request validation errors.
    
    Converts Pydantic validation errors to user-friendly messages.
    """
    logger.warning(f"Validation error: {exc.errors()}", extra={
        "path": request.url.path,
        "method": request.method,
        "errors": exc.errors()
    })
    
    response_data = ErrorResponseBuilder.build_validation_error_response(exc.errors())
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=response_data
    )


async def pydantic_validation_exception_handler(request: Request, exc: PydanticValidationError) -> JSONResponse:
    """
    Handler for direct Pydantic validation errors.
    
    Handles cases where Pydantic validation is called directly.
    """
    logger.warning(f"Pydantic validation error: {exc.errors()}", extra={
        "path": request.url.path,
        "method": request.method,
        "errors": exc.errors()
    })
    
    response_data = ErrorResponseBuilder.build_validation_error_response(exc.errors())
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=response_data
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handler for FastAPI HTTP exceptions.
    
    Provides consistent error format for HTTP exceptions.
    """
    logger.warning(f"HTTP exception: {exc.detail}", extra={
        "status_code": exc.status_code,
        "path": request.url.path,
        "method": request.method
    })
    
    # Map status codes to user-friendly messages
    user_message = exc.detail
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        user_message = "The requested resource was not found."
    elif exc.status_code == status.HTTP_403_FORBIDDEN:
        user_message = ErrorMessages.Auth.INSUFFICIENT_PERMISSIONS
    elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
        user_message = ErrorMessages.Auth.INVALID_CREDENTIALS
    
    response_data = ErrorResponseBuilder.build_error_response(
        message=user_message,
        status_code=exc.status_code,
        error_type="http_error"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=response_data
    )


async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handler for Starlette HTTP exceptions.
    
    Handles lower-level HTTP exceptions from Starlette.
    """
    logger.warning(f"Starlette HTTP exception: {exc.detail}", extra={
        "status_code": exc.status_code,
        "path": request.url.path,
        "method": request.method
    })
    
    response_data = ErrorResponseBuilder.build_error_response(
        message=str(exc.detail),
        status_code=exc.status_code,
        error_type="http_error"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=response_data
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler for unexpected exceptions.
    
    Catches all unhandled exceptions and provides a generic error response.
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True, extra={
        "path": request.url.path,
        "method": request.method,
        "exception_type": exc.__class__.__name__
    })
    
    response_data = ErrorResponseBuilder.build_error_response(
        message=ErrorMessages.System.INTERNAL_ERROR,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_type="internal_error",
        details={"exception_type": exc.__class__.__name__} if logger.level <= logging.DEBUG else None
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=response_data
    )


def setup_error_handlers(app: FastAPI) -> None:
    """
    Setup all error handlers for the FastAPI application.
    
    Following Dependency Inversion Principle (DIP) - depends on FastAPI abstraction.
    """
    
    # Custom application exceptions (highest priority)
    app.add_exception_handler(BaseAppException, base_app_exception_handler)
    
    # Validation exceptions
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(PydanticValidationError, pydantic_validation_exception_handler)
    
    # HTTP exceptions
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, starlette_http_exception_handler)
    
    # Generic exception handler (lowest priority)
    app.add_exception_handler(Exception, generic_exception_handler)
    
    logger.info("Error handlers setup completed")


class ErrorUtils:
    """
    Utility functions for error handling.
    
    Following Single Responsibility Principle (SRP) - utilities for error processing.
    """
    
    @staticmethod
    def extract_field_from_error(error: dict) -> str:
        """Extract field name from validation error."""
        return ".".join(str(loc) for loc in error.get("loc", []))
    
    @staticmethod
    def is_email_validation_error(error: dict) -> bool:
        """Check if error is related to email validation."""
        msg = error.get("msg", "").lower()
        return "email" in msg or "not valid" in msg
    
    @staticmethod
    def is_password_validation_error(error: dict) -> bool:
        """Check if error is related to password validation."""
        field = ErrorUtils.extract_field_from_error(error)
        return "password" in field.lower()
    
    @staticmethod
    def format_validation_message(error: dict) -> str:
        """Format validation error message to be user-friendly."""
        field = ErrorUtils.extract_field_from_error(error)
        msg = error.get("msg", "")
        
        if ErrorUtils.is_email_validation_error(error):
            return ErrorMessages.Validation.INVALID_EMAIL_FORMAT
        elif ErrorUtils.is_password_validation_error(error):
            if "too short" in msg.lower():
                return ErrorMessages.Validation.PASSWORD_TOO_SHORT
            else:
                return ErrorMessages.Validation.PASSWORD_TOO_WEAK
        elif "required" in msg.lower():
            return ErrorMessages.Validation.REQUIRED_FIELD
        else:
            return msg 