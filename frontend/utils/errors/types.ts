/**
 * TypeScript types and interfaces for error handling.
 * 
 * Following Interface Segregation Principle (ISP) - specific interfaces
 * for different types of errors and error handling scenarios.
 */

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error types that can occur in the application
export enum ErrorType {
  VALIDATION = 'validation_error',
  AUTHENTICATION = 'authentication_error',
  AUTHORIZATION = 'authorization_error',
  NETWORK = 'network_error',
  NOT_FOUND = 'not_found_error',
  CONFLICT = 'conflict_error',
  INTERNAL = 'internal_error',
  BUSINESS_LOGIC = 'business_logic_error'
}

// Error categories for UI display
export enum ErrorCategory {
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission'
}

// Base error interface
export interface BaseError {
  message: string;
  type: ErrorType;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  code?: string | number;
}

// Validation error with field-specific details
export interface ValidationError extends BaseError {
  type: ErrorType.VALIDATION;
  field?: string;
  fieldErrors?: Record<string, string>;
  value?: unknown;
}

// Network error with request details
export interface NetworkError extends BaseError {
  type: ErrorType.NETWORK;
  status?: number;
  url?: string;
  method?: string;
  isConnectivityError?: boolean;
  retryable?: boolean;
}

// Authentication error
export interface AuthenticationError extends BaseError {
  type: ErrorType.AUTHENTICATION;
  isTokenExpired?: boolean;
  requiresLogin?: boolean;
}

// Authorization error
export interface AuthorizationError extends BaseError {
  type: ErrorType.AUTHORIZATION;
  resource?: string;
  action?: string;
  requiredRole?: string;
}

// Business logic error
export interface BusinessLogicError extends BaseError {
  type: ErrorType.BUSINESS_LOGIC;
  businessRule?: string;
  context?: Record<string, unknown>;
}

// Union type for all possible errors
export type AppError = 
  | ValidationError
  | NetworkError
  | AuthenticationError
  | AuthorizationError
  | BusinessLogicError
  | BaseError;

// Error response from API
export interface ApiErrorResponse {
  error: boolean;
  message: string;
  error_type: string;
  status_code: number;
  details?: Record<string, unknown>;
  field_errors?: Record<string, string>;
}

// Error context for error boundaries and logging
export interface ErrorContext {
  componentStack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  additionalInfo?: Record<string, unknown>;
}

// Error handler function type
export type ErrorHandler = (error: AppError, context?: ErrorContext) => void;

// Error display props for UI components
export interface ErrorDisplayProps {
  error: AppError;
  onDismiss?: () => void;
  onRetry?: () => void;
  showDetails?: boolean;
  variant?: 'inline' | 'banner' | 'modal' | 'toast';
}

// Form error state
export interface FormErrorState {
  hasErrors: boolean;
  fieldErrors: Record<string, string>;
  globalError?: string;
  isSubmitting: boolean;
}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorContext;
  retryCount: number;
  maxRetries: number;
}

// Network retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

// Error notification configuration
export interface ErrorNotificationConfig {
  duration: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  dismissible: boolean;
  showIcon: boolean;
  animate: boolean;
}

// Error logging configuration
export interface ErrorLoggingConfig {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  includeStackTrace: boolean;
  includeUserContext: boolean;
  endpoint?: string;
}

// Error recovery strategy
export interface ErrorRecoveryStrategy {
  canRecover: (error: AppError) => boolean;
  recover: (error: AppError) => Promise<void>;
  fallback?: () => void;
}

// Type guards for error types
export const isValidationError = (error: AppError): error is ValidationError =>
  error.type === ErrorType.VALIDATION;

export const isNetworkError = (error: AppError): error is NetworkError =>
  error.type === ErrorType.NETWORK;

export const isAuthenticationError = (error: AppError): error is AuthenticationError =>
  error.type === ErrorType.AUTHENTICATION;

export const isAuthorizationError = (error: AppError): error is AuthorizationError =>
  error.type === ErrorType.AUTHORIZATION;

export const isBusinessLogicError = (error: AppError): error is BusinessLogicError =>
  error.type === ErrorType.BUSINESS_LOGIC; 