/**
 * Error utility functions for common error handling operations.
 * 
 * Following Single Responsibility Principle (SRP) - each function handles one specific utility.
 * Following Open/Closed Principle (OCP) - easy to extend with new utilities without modifying existing ones.
 */

import {
  AppError,
  ErrorType,
  ErrorSeverity,
  ErrorCategory,
  ValidationError,
  NetworkError,
  AuthenticationError,
  isValidationError,
  isNetworkError,
  isAuthenticationError,
  FormErrorState
} from './types';
import { ErrorMessages } from './constants';

/**
 * Error utility class following Single Responsibility Principle.
 */
export class ErrorUtils {
  /**
   * Checks if an error is retryable based on its type and properties.
   */
  static isRetryable(error: AppError): boolean {
    if (isNetworkError(error)) {
      return error.retryable ?? true;
    }
    
    if (error.type === ErrorType.INTERNAL) {
      return true;
    }
    
    return false;
  }

  /**
   * Gets a user-friendly error title based on error type.
   */
  static getErrorTitle(error: AppError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'Validation Error';
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required';
      case ErrorType.AUTHORIZATION:
        return 'Access Denied';
      case ErrorType.NETWORK:
        return 'Connection Problem';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.CONFLICT:
        return 'Conflict';
      case ErrorType.INTERNAL:
        return 'System Error';
      case ErrorType.BUSINESS_LOGIC:
        return 'Action Not Allowed';
      default:
        return 'Error';
    }
  }

  /**
   * Gets appropriate error icon based on error severity.
   */
  static getErrorIcon(error: AppError): string {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        return 'ℹ️';
      case ErrorSeverity.WARNING:
        return '⚠️';
      case ErrorSeverity.ERROR:
        return '❌';
      case ErrorSeverity.CRITICAL:
        return '🚨';
      default:
        return '❌';
    }
  }

  /**
   * Gets CSS class name for error styling based on severity.
   */
  static getErrorClassName(error: AppError): string {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        return 'error-info';
      case ErrorSeverity.WARNING:
        return 'error-warning';
      case ErrorSeverity.ERROR:
        return 'error-error';
      case ErrorSeverity.CRITICAL:
        return 'error-critical';
      default:
        return 'error-error';
    }
  }

  /**
   * Determines if an error should auto-hide based on its properties.
   */
  static shouldAutoHide(error: AppError): boolean {
    // Network errors can auto-hide if they're not critical
    if (isNetworkError(error) && error.severity !== ErrorSeverity.CRITICAL) {
      return true;
    }
    
    // Info messages can auto-hide
    if (error.severity === ErrorSeverity.INFO) {
      return true;
    }
    
    return false;
  }

  /**
   * Gets auto-hide duration in milliseconds based on error severity.
   */
  static getAutoHideDuration(error: AppError): number {
    switch (error.severity) {
      case ErrorSeverity.INFO:
        return 3000; // 3 seconds
      case ErrorSeverity.WARNING:
        return 5000; // 5 seconds
      case ErrorSeverity.ERROR:
        return 0; // Don't auto-hide
      case ErrorSeverity.CRITICAL:
        return 0; // Don't auto-hide
      default:
        return 5000;
    }
  }

  /**
   * Checks if an error requires immediate user attention.
   */
  static requiresImmediateAttention(error: AppError): boolean {
    return error.severity === ErrorSeverity.CRITICAL ||
           isAuthenticationError(error) ||
           error.type === ErrorType.AUTHORIZATION;
  }

  /**
   * Formats error for logging purposes.
   */
  static formatForLogging(error: AppError, context?: Record<string, unknown>): Record<string, unknown> {
    return {
      message: error.message,
      type: error.type,
      category: error.category,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      code: error.code,
      ...context,
      // Add specific error properties
      ...(isValidationError(error) && {
        field: error.field,
        fieldErrors: error.fieldErrors
      }),
      ...(isNetworkError(error) && {
        status: error.status,
        url: error.url,
        method: error.method,
        isConnectivityError: error.isConnectivityError
      }),
      ...(isAuthenticationError(error) && {
        isTokenExpired: error.isTokenExpired,
        requiresLogin: error.requiresLogin
      })
    };
  }

  /**
   * Creates a sanitized error for user display (removes sensitive information).
   */
  static sanitizeForDisplay(error: AppError): AppError {
    // Create a copy to avoid mutating the original
    const sanitized = { ...error };
    
    // Remove potentially sensitive information
    if (isValidationError(sanitized) && sanitized.value) {
      // Don't expose the actual invalid value
      delete sanitized.value;
    }
    
    return sanitized;
  }

  /**
   * Extracts field errors from a validation error for form display.
   */
  static extractFieldErrors(error: AppError): Record<string, string> {
    if (isValidationError(error) && error.fieldErrors) {
      return error.fieldErrors;
    }
    return {};
  }

  /**
   * Checks if two errors are essentially the same (for deduplication).
   */
  static areErrorsSimilar(error1: AppError, error2: AppError): boolean {
    return error1.type === error2.type &&
           error1.message === error2.message &&
           error1.code === error2.code;
  }

  /**
   * Gets a short summary of the error for notifications.
   */
  static getErrorSummary(error: AppError, maxLength: number = 100): string {
    let summary = error.message;
    
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + '...';
    }
    
    return summary;
  }

  /**
   * Determines the appropriate retry delay for network errors.
   */
  static getRetryDelay(error: AppError, attemptNumber: number): number {
    if (!this.isRetryable(error)) {
      return 0;
    }
    
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
    
    // Add some jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }
}

/**
 * Form error utilities following Single Responsibility Principle.
 */
export class FormErrorUtils {
  /**
   * Creates a form error state from an AppError.
   */
  static createFormErrorState(error: AppError): FormErrorState {
    if (isValidationError(error)) {
      return {
        hasErrors: true,
        fieldErrors: error.fieldErrors || {},
        globalError: error.fieldErrors ? undefined : error.message,
        isSubmitting: false
      };
    }
    
    return {
      hasErrors: true,
      fieldErrors: {},
      globalError: error.message,
      isSubmitting: false
    };
  }

  /**
   * Clears specific field error from form state.
   */
  static clearFieldError(
    formState: FormErrorState, 
    fieldName: string
  ): FormErrorState {
    const newFieldErrors = { ...formState.fieldErrors };
    delete newFieldErrors[fieldName];
    
    return {
      ...formState,
      fieldErrors: newFieldErrors,
      hasErrors: Object.keys(newFieldErrors).length > 0 || !!formState.globalError
    };
  }

  /**
   * Adds a field error to form state.
   */
  static addFieldError(
    formState: FormErrorState,
    fieldName: string,
    message: string
  ): FormErrorState {
    return {
      ...formState,
      fieldErrors: {
        ...formState.fieldErrors,
        [fieldName]: message
      },
      hasErrors: true
    };
  }

  /**
   * Clears all errors from form state.
   */
  static clearAllErrors(formState: FormErrorState): FormErrorState {
    return {
      hasErrors: false,
      fieldErrors: {},
      globalError: undefined,
      isSubmitting: formState.isSubmitting
    };
  }

  /**
   * Gets first field error for quick display.
   */
  static getFirstFieldError(formState: FormErrorState): string | undefined {
    const fieldNames = Object.keys(formState.fieldErrors);
    if (fieldNames.length > 0) {
      return formState.fieldErrors[fieldNames[0]];
    }
    return undefined;
  }
}

/**
 * Convenience functions for common error scenarios.
 */

/**
 * Creates a generic network error.
 */
export function createNetworkError(message?: string): NetworkError {
  return {
    message: message || ErrorMessages.Network.CONNECTION_ERROR,
    type: ErrorType.NETWORK,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.WARNING,
    timestamp: new Date(),
    retryable: true
  };
}

/**
 * Creates a validation error for a specific field.
 */
export function createFieldValidationError(field: string, message: string): ValidationError {
  return {
    message: ErrorMessages.Form.FORM_INVALID,
    type: ErrorType.VALIDATION,
    category: ErrorCategory.USER_INPUT,
    severity: ErrorSeverity.WARNING,
    timestamp: new Date(),
    field,
    fieldErrors: { [field]: message }
  };
}

/**
 * Creates an authentication required error.
 */
export function createAuthRequiredError(): AuthenticationError {
  return {
    message: ErrorMessages.Auth.LOGIN_REQUIRED,
    type: ErrorType.AUTHENTICATION,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.ERROR,
    timestamp: new Date(),
    requiresLogin: true
  };
}

/**
 * Debounces error notifications to prevent spam.
 */
export class ErrorDebouncer {
  private static errorCache = new Map<string, number>();
  private static readonly DEBOUNCE_WINDOW = 5000; // 5 seconds

  static shouldShowError(error: AppError): boolean {
    const errorKey = `${error.type}-${error.message}`;
    const now = Date.now();
    const lastShown = this.errorCache.get(errorKey);

    if (!lastShown || now - lastShown > this.DEBOUNCE_WINDOW) {
      this.errorCache.set(errorKey, now);
      return true;
    }

    return false;
  }

  static clearCache(): void {
    this.errorCache.clear();
  }
} 