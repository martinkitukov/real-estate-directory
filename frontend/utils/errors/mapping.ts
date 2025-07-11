/**
 * Error mapping utilities for converting backend API errors to frontend error objects.
 * 
 * Following Single Responsibility Principle (SRP) - this module only handles error mapping.
 * Following Dependency Inversion Principle (DIP) - depends on error interfaces, not concrete implementations.
 */

import {
  AppError,
  ApiErrorResponse,
  ErrorType,
  ErrorCategory,
  ErrorSeverity,
  ValidationError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  BaseError
} from './types';
import { ErrorMessages, ErrorConfigs, ErrorCodes } from './constants';

/**
 * Maps HTTP status codes to error types.
 * Following Open/Closed Principle (OCP) - easy to extend without modification.
 */
const STATUS_CODE_TO_ERROR_TYPE: Record<number, ErrorType> = {
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTHENTICATION,
  403: ErrorType.AUTHORIZATION,
  404: ErrorType.NOT_FOUND,
  409: ErrorType.CONFLICT,
  422: ErrorType.VALIDATION,
  429: ErrorType.INTERNAL, // Rate limiting
  500: ErrorType.INTERNAL,
  502: ErrorType.NETWORK,
  503: ErrorType.NETWORK,
  504: ErrorType.NETWORK,
};

/**
 * Maps backend error types to frontend error types.
 */
const BACKEND_ERROR_TYPE_MAPPING: Record<string, ErrorType> = {
  'validation_error': ErrorType.VALIDATION,
  'authentication_error': ErrorType.AUTHENTICATION,
  'authorization_error': ErrorType.AUTHORIZATION,
  'not_found_error': ErrorType.NOT_FOUND,
  'conflict_error': ErrorType.CONFLICT,
  'internal_error': ErrorType.INTERNAL,
  'business_logic_error': ErrorType.BUSINESS_LOGIC,
  'http_error': ErrorType.INTERNAL,
};

/**
 * Error mapper class following Single Responsibility Principle.
 */
export class ErrorMapper {
  /**
   * Maps an API error response to a frontend AppError.
   */
  static mapApiError(apiError: ApiErrorResponse, context?: {
    url?: string;
    method?: string;
  }): AppError {
    const errorType = this.determineErrorType(apiError);
    const config = ErrorConfigs[errorType];

    const baseError: BaseError = {
      message: this.mapErrorMessage(apiError, errorType),
      type: errorType,
      category: config.category,
      severity: config.severity,
      timestamp: new Date(),
      code: apiError.status_code
    };

    // Create specific error types based on the error type
    switch (errorType) {
      case ErrorType.VALIDATION:
        return this.createValidationError(apiError, baseError);
      
      case ErrorType.AUTHENTICATION:
        return this.createAuthenticationError(apiError, baseError);
      
      case ErrorType.AUTHORIZATION:
        return this.createAuthorizationError(apiError, baseError);
      
      case ErrorType.NETWORK:
        return this.createNetworkError(apiError, baseError, context);
      
      case ErrorType.BUSINESS_LOGIC:
        return this.createBusinessLogicError(apiError, baseError);
      
      default:
        return baseError;
    }
  }

  /**
   * Maps a network error (e.g., fetch failure) to a NetworkError.
   */
  static mapNetworkError(error: Error, context?: {
    url?: string;
    method?: string;
    status?: number;
  }): NetworkError {
    const isConnectivityError = this.isConnectivityError(error);
    
    return {
      message: this.getNetworkErrorMessage(error, isConnectivityError),
      type: ErrorType.NETWORK,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.WARNING,
      timestamp: new Date(),
      status: context?.status,
      url: context?.url,
      method: context?.method,
      isConnectivityError,
      retryable: true,
      code: ErrorCodes.NETWORK_ERROR
    };
  }

  /**
   * Maps a generic JavaScript error to an AppError.
   */
  static mapGenericError(error: Error): BaseError {
    return {
      message: ErrorMessages.System.INTERNAL_ERROR,
      type: ErrorType.INTERNAL,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.CRITICAL,
      timestamp: new Date(),
      code: ErrorCodes.INTERNAL_ERROR
    };
  }

  /**
   * Determines the error type from an API error response.
   */
  private static determineErrorType(apiError: ApiErrorResponse): ErrorType {
    // First, try to map from the backend error_type field
    if (apiError.error_type && BACKEND_ERROR_TYPE_MAPPING[apiError.error_type]) {
      return BACKEND_ERROR_TYPE_MAPPING[apiError.error_type];
    }

    // Fall back to status code mapping
    return STATUS_CODE_TO_ERROR_TYPE[apiError.status_code] || ErrorType.INTERNAL;
  }

  /**
   * Maps error message from API response to user-friendly message.
   */
  private static mapErrorMessage(apiError: ApiErrorResponse, errorType: ErrorType): string {
    // If we have a user-friendly message from the backend, use it
    if (apiError.message && !this.isGenericBackendMessage(apiError.message)) {
      return apiError.message;
    }

    // Map specific error patterns to user-friendly messages
    const message = apiError.message?.toLowerCase() || '';
    
    if (errorType === ErrorType.VALIDATION) {
      if (message.includes('email')) {
        return ErrorMessages.Validation.INVALID_EMAIL_FORMAT;
      }
      if (message.includes('password')) {
        return ErrorMessages.Validation.PASSWORD_TOO_WEAK;
      }
      if (message.includes('required')) {
        return ErrorMessages.Validation.REQUIRED_FIELD;
      }
      return ErrorMessages.System.INVALID_REQUEST;
    }

    if (errorType === ErrorType.AUTHENTICATION) {
      if (message.includes('expired')) {
        return ErrorMessages.Auth.TOKEN_EXPIRED;
      }
      if (message.includes('invalid') || message.includes('credentials')) {
        return ErrorMessages.Auth.INVALID_CREDENTIALS;
      }
      return ErrorMessages.Auth.INVALID_CREDENTIALS;
    }

    if (errorType === ErrorType.AUTHORIZATION) {
      return ErrorMessages.Auth.INSUFFICIENT_PERMISSIONS;
    }

    if (errorType === ErrorType.CONFLICT) {
      if (message.includes('email')) {
        return ErrorMessages.User.EMAIL_ALREADY_EXISTS;
      }
      return 'A conflict occurred. Please try again.';
    }

    if (errorType === ErrorType.NOT_FOUND) {
      return ErrorMessages.Navigation.PAGE_NOT_FOUND;
    }

    // Default fallback
    return ErrorMessages.System.INTERNAL_ERROR;
  }

  /**
   * Creates a ValidationError from API response.
   */
  private static createValidationError(apiError: ApiErrorResponse, baseError: BaseError): ValidationError {
    return {
      ...baseError,
      type: ErrorType.VALIDATION,
      fieldErrors: apiError.field_errors,
      field: this.extractFieldFromError(apiError)
    };
  }

  /**
   * Creates an AuthenticationError from API response.
   */
  private static createAuthenticationError(apiError: ApiErrorResponse, baseError: BaseError): AuthenticationError {
    const message = apiError.message?.toLowerCase() || '';
    
    return {
      ...baseError,
      type: ErrorType.AUTHENTICATION,
      isTokenExpired: message.includes('expired'),
      requiresLogin: true
    };
  }

  /**
   * Creates an AuthorizationError from API response.
   */
  private static createAuthorizationError(apiError: ApiErrorResponse, baseError: BaseError): AuthorizationError {
    return {
      ...baseError,
      type: ErrorType.AUTHORIZATION,
      resource: apiError.details?.resource as string,
      action: apiError.details?.action as string
    };
  }

  /**
   * Creates a NetworkError from API response.
   */
  private static createNetworkError(
    apiError: ApiErrorResponse, 
    baseError: BaseError, 
    context?: { url?: string; method?: string }
  ): NetworkError {
    return {
      ...baseError,
      type: ErrorType.NETWORK,
      status: apiError.status_code,
      url: context?.url,
      method: context?.method,
      retryable: this.isRetryableStatus(apiError.status_code)
    };
  }

  /**
   * Creates a BusinessLogicError from API response.
   */
  private static createBusinessLogicError(apiError: ApiErrorResponse, baseError: BaseError): BusinessLogicError {
    return {
      ...baseError,
      type: ErrorType.BUSINESS_LOGIC,
      businessRule: apiError.details?.business_rule as string,
      context: apiError.details
    };
  }

  /**
   * Checks if an error is a connectivity error.
   */
  private static isConnectivityError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('connection') ||
           message.includes('timeout') ||
           error.name === 'TypeError' && message.includes('failed to fetch');
  }

  /**
   * Gets appropriate network error message.
   */
  private static getNetworkErrorMessage(error: Error, isConnectivityError: boolean): string {
    if (isConnectivityError) {
      return ErrorMessages.Network.CONNECTION_ERROR;
    }

    const message = error.message.toLowerCase();
    if (message.includes('timeout')) {
      return ErrorMessages.Network.TIMEOUT_ERROR;
    }
    if (message.includes('abort')) {
      return ErrorMessages.Network.TIMEOUT_ERROR;
    }

    return ErrorMessages.Network.SERVER_ERROR;
  }

  /**
   * Checks if a status code is retryable.
   */
  private static isRetryableStatus(status: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  /**
   * Checks if a message is a generic backend message that should be replaced.
   */
  private static isGenericBackendMessage(message: string): boolean {
    const genericMessages = [
      'internal server error',
      'bad request',
      'unauthorized',
      'forbidden',
      'not found',
      'validation error'
    ];
    
    const lowerMessage = message.toLowerCase();
    return genericMessages.some(generic => lowerMessage.includes(generic));
  }

  /**
   * Extracts field name from error details.
   */
  private static extractFieldFromError(apiError: ApiErrorResponse): string | undefined {
    if (apiError.field_errors) {
      return Object.keys(apiError.field_errors)[0];
    }
    return apiError.details?.field as string;
  }
}

/**
 * Convenience functions for common error mapping scenarios.
 * Following Single Responsibility Principle - each function handles one type of mapping.
 */

/**
 * Maps a fetch response error to an AppError.
 */
export async function mapFetchError(response: Response, url: string, method: string): Promise<AppError> {
  try {
    const apiError: ApiErrorResponse = await response.json();
    return ErrorMapper.mapApiError(apiError, { url, method });
  } catch {
    // If we can't parse the response, create a generic network error
    return ErrorMapper.mapNetworkError(
      new Error(`HTTP ${response.status} ${response.statusText}`),
      { url, method, status: response.status }
    );
  }
}

/**
 * Maps a fetch network error to a NetworkError.
 */
export function mapFetchNetworkError(error: Error, url: string, method: string): NetworkError {
  return ErrorMapper.mapNetworkError(error, { url, method });
}

/**
 * Maps validation errors from form libraries to ValidationError.
 */
export function mapValidationErrors(fieldErrors: Record<string, string>): ValidationError {
  return {
    message: ErrorMessages.Form.FORM_INVALID,
    type: ErrorType.VALIDATION,
    category: ErrorCategory.USER_INPUT,
    severity: ErrorSeverity.WARNING,
    timestamp: new Date(),
    fieldErrors,
    code: ErrorCodes.VALIDATION_ERROR
  };
}

/**
 * Maps authentication errors for token expiration.
 */
export function mapTokenExpiredError(): AuthenticationError {
  return {
    message: ErrorMessages.Auth.TOKEN_EXPIRED,
    type: ErrorType.AUTHENTICATION,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.ERROR,
    timestamp: new Date(),
    isTokenExpired: true,
    requiresLogin: true,
    code: ErrorCodes.TOKEN_EXPIRED
  };
} 