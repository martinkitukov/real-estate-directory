/**
 * Error message constants for the frontend application.
 * 
 * Following Single Responsibility Principle (SRP) - this module only handles error message definitions.
 * All error messages are centralized here for consistency and maintainability.
 */

import { ErrorType, ErrorCategory, ErrorSeverity } from './types';

/**
 * Error message constants organized by domain.
 * 
 * Following Open/Closed Principle (OCP) - easy to extend with new domains
 * without modifying existing code.
 */
export const ErrorMessages = {
  // Authentication & Authorization Messages
  Auth: {
    INVALID_CREDENTIALS: "Invalid email or password. Please check your credentials and try again.",
    EMAIL_NOT_FOUND: "No account found with this email address.",
    INCORRECT_PASSWORD: "The password you entered is incorrect.",
    TOKEN_EXPIRED: "Your session has expired. Please log in again.",
    TOKEN_INVALID: "Invalid authentication token. Please log in again.",
    INSUFFICIENT_PERMISSIONS: "You don't have permission to access this resource.",
    ACCOUNT_DISABLED: "Your account has been disabled. Please contact support.",
    LOGOUT_SUCCESS: "You have been successfully logged out.",
    LOGIN_REQUIRED: "Please log in to access this page.",
    SESSION_TIMEOUT: "Your session has timed out. Please log in again.",
  },

  // Validation Messages
  Validation: {
    REQUIRED_FIELD: "This field is required.",
    INVALID_EMAIL: "Please enter a valid email address.",
    INVALID_EMAIL_FORMAT: "Email must be in a valid format (e.g., user@example.com).",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
    PASSWORD_TOO_WEAK: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",
    INVALID_PHONE: "Please enter a valid phone number.",
    INVALID_URL: "Please enter a valid URL.",
    INVALID_DATE: "Please enter a valid date.",
    INVALID_ENUM_VALUE: "Please select a valid option from the available choices.",
    FIELD_TOO_LONG: "This field exceeds the maximum allowed length.",
    FIELD_TOO_SHORT: "This field is too short.",
    INVALID_FORMAT: "Please enter a valid format.",
  },

  // User Management Messages
  User: {
    EMAIL_ALREADY_EXISTS: "An account with this email address already exists.",
    USER_NOT_FOUND: "User not found.",
    USER_CREATED_SUCCESS: "Account created successfully! You can now log in.",
    PROFILE_UPDATED_SUCCESS: "Your profile has been updated successfully.",
    REGISTRATION_SUCCESS: "Registration successful! Please check your email for verification.",
    EMAIL_VERIFICATION_REQUIRED: "Please verify your email address to continue.",
    ACCOUNT_LOCKED: "Your account has been locked. Please contact support.",
  },

  // Developer Messages
  Developer: {
    COMPANY_NAME_REQUIRED: "Company name is required for developer registration.",
    CONTACT_PERSON_REQUIRED: "Contact person name is required.",
    DEVELOPER_NOT_FOUND: "Developer not found.",
    DEVELOPER_ALREADY_VERIFIED: "This developer account is already verified.",
    VERIFICATION_PENDING: "Your developer account is pending verification.",
    VERIFICATION_REJECTED: "Your developer verification has been rejected. Please contact support.",
    VERIFICATION_SUCCESS: "Your developer account has been verified!",
    PROFILE_INCOMPLETE: "Please complete your developer profile to continue.",
  },

  // Project Messages  
  Project: {
    PROJECT_NOT_FOUND: "Project not found.",
    PROJECT_TITLE_REQUIRED: "Project title is required.",
    PROJECT_DESCRIPTION_REQUIRED: "Project description is required.",
    PROJECT_LOCATION_REQUIRED: "Project location is required.",
    INVALID_PROJECT_STATUS: "Please select a valid project status.",
    INVALID_PROJECT_TYPE: "Please select a valid project type.",
    PROJECT_CREATED_SUCCESS: "Project created successfully!",
    PROJECT_UPDATED_SUCCESS: "Project updated successfully!",
    PROJECT_DELETED_SUCCESS: "Project deleted successfully!",
    UNAUTHORIZED_PROJECT_ACCESS: "You don't have permission to access this project.",
    PROJECT_LOAD_FAILED: "Failed to load project details. Please try again.",
    PROJECTS_LOAD_FAILED: "Failed to load projects. Please try again.",
  },

  // Network & System Messages
  Network: {
    CONNECTION_ERROR: "Unable to connect to server. Please check your internet connection.",
    TIMEOUT_ERROR: "Request timed out. Please try again.",
    SERVER_ERROR: "Server error occurred. Please try again later.",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later.",
    SLOW_CONNECTION: "Connection is slow. Please wait or try again later.",
    OFFLINE: "You appear to be offline. Please check your internet connection.",
    RETRY_SUGGESTED: "Something went wrong. Please try again.",
  },

  // General System Messages
  System: {
    INTERNAL_ERROR: "An unexpected error occurred. Please try again later.",
    DATABASE_ERROR: "Database connection error. Please try again later.",
    LOADING_ERROR: "Failed to load data. Please refresh the page and try again.",
    SAVE_ERROR: "Failed to save changes. Please try again.",
    DELETE_ERROR: "Failed to delete item. Please try again.",
    UPDATE_ERROR: "Failed to update. Please try again.",
    INVALID_REQUEST: "Invalid request format.",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
    MAINTENANCE_MODE: "The system is currently under maintenance. Please try again later.",
    FEATURE_UNAVAILABLE: "This feature is currently unavailable.",
  },

  // File Upload Messages
  FileUpload: {
    FILE_TOO_LARGE: "File size exceeds the maximum limit of {maxSize}MB.",
    INVALID_FILE_TYPE: "Invalid file type. Allowed types: {allowedTypes}.",
    UPLOAD_FAILED: "File upload failed. Please try again.",
    FILE_NOT_FOUND: "File not found.",
    PROCESSING_FILE: "Processing file...",
    UPLOAD_SUCCESS: "File uploaded successfully!",
    DRAG_DROP_HINT: "Drag and drop files here, or click to select files.",
  },

  // Form Messages
  Form: {
    UNSAVED_CHANGES: "You have unsaved changes. Are you sure you want to leave?",
    FORM_INVALID: "Please correct the errors below before submitting.",
    SUBMITTING: "Submitting...",
    SUBMIT_SUCCESS: "Form submitted successfully!",
    SUBMIT_FAILED: "Failed to submit form. Please try again.",
    FIELD_UPDATED: "Field updated successfully.",
    CHANGES_SAVED: "Changes saved successfully!",
    AUTO_SAVE_FAILED: "Auto-save failed. Please save manually.",
  },

  // Search & Filter Messages
  Search: {
    NO_RESULTS: "No results found for your search.",
    SEARCH_ERROR: "Search failed. Please try again.",
    LOADING_RESULTS: "Loading search results...",
    REFINE_SEARCH: "Try refining your search terms.",
    CLEAR_FILTERS: "Clear all filters to see more results.",
    SEARCH_TOO_SHORT: "Search term must be at least 3 characters long.",
  },

  // Business Logic Messages
  Business: {
    SUBSCRIPTION_EXPIRED: "Your subscription has expired. Please renew to continue.",
    SUBSCRIPTION_REQUIRED: "This feature requires an active subscription.",
    QUOTA_EXCEEDED: "You have exceeded your usage quota for this feature.",
    FEATURE_NOT_AVAILABLE: "This feature is not available in your current plan.",
    TRIAL_EXPIRED: "Your free trial has expired. Please upgrade to continue.",
    PAYMENT_REQUIRED: "Payment is required to access this feature.",
  },

  // Navigation Messages
  Navigation: {
    PAGE_NOT_FOUND: "The page you're looking for doesn't exist.",
    ACCESS_DENIED: "You don't have permission to access this page.",
    REDIRECT_FAILED: "Redirect failed. Please navigate manually.",
    LOADING_PAGE: "Loading page...",
    NAVIGATION_ERROR: "Navigation error occurred.",
  }
} as const;

/**
 * Error codes mapping for different error types.
 * Used for programmatic error handling and analytics.
 */
export const ErrorCodes = {
  // Authentication errors (1000-1099)
  INVALID_CREDENTIALS: 1001,
  TOKEN_EXPIRED: 1002,
  TOKEN_INVALID: 1003,
  INSUFFICIENT_PERMISSIONS: 1004,
  ACCOUNT_DISABLED: 1005,

  // Validation errors (1100-1199)
  VALIDATION_ERROR: 1100,
  REQUIRED_FIELD: 1101,
  INVALID_EMAIL: 1102,
  PASSWORD_TOO_WEAK: 1103,
  INVALID_FORMAT: 1104,

  // Network errors (1200-1299)
  NETWORK_ERROR: 1200,
  CONNECTION_ERROR: 1201,
  TIMEOUT_ERROR: 1202,
  SERVER_ERROR: 1203,
  SERVICE_UNAVAILABLE: 1204,

  // System errors (1300-1399)
  INTERNAL_ERROR: 1300,
  DATABASE_ERROR: 1301,
  FILE_UPLOAD_ERROR: 1302,
  RATE_LIMIT_EXCEEDED: 1303,

  // Business logic errors (1400-1499)
  BUSINESS_LOGIC_ERROR: 1400,
  SUBSCRIPTION_REQUIRED: 1401,
  QUOTA_EXCEEDED: 1402,
  FEATURE_UNAVAILABLE: 1403,
} as const;

/**
 * Default error configurations for different error types.
 * Following Open/Closed Principle - easy to extend without modification.
 */
export const ErrorConfigs = {
  [ErrorType.VALIDATION]: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.USER_INPUT,
    retryable: false,
    dismissible: true,
    autoHide: false,
  },
  [ErrorType.AUTHENTICATION]: {
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.AUTHENTICATION,
    retryable: true,
    dismissible: true,
    autoHide: false,
  },
  [ErrorType.AUTHORIZATION]: {
    severity: ErrorSeverity.ERROR,
    category: ErrorCategory.PERMISSION,
    retryable: false,
    dismissible: true,
    autoHide: false,
  },
  [ErrorType.NETWORK]: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.NETWORK,
    retryable: true,
    dismissible: true,
    autoHide: true,
  },
  [ErrorType.NOT_FOUND]: {
    severity: ErrorSeverity.INFO,
    category: ErrorCategory.SYSTEM,
    retryable: false,
    dismissible: true,
    autoHide: false,
  },
  [ErrorType.CONFLICT]: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.USER_INPUT,
    retryable: false,
    dismissible: true,
    autoHide: false,
  },
  [ErrorType.INTERNAL]: {
    severity: ErrorSeverity.CRITICAL,
    category: ErrorCategory.SYSTEM,
    retryable: true,
    dismissible: false,
    autoHide: false,
  },
  [ErrorType.BUSINESS_LOGIC]: {
    severity: ErrorSeverity.WARNING,
    category: ErrorCategory.USER_INPUT,
    retryable: false,
    dismissible: true,
    autoHide: false,
  },
} as const;

/**
 * User-friendly error titles for different error types.
 */
export const ErrorTitles = {
  [ErrorType.VALIDATION]: "Validation Error",
  [ErrorType.AUTHENTICATION]: "Authentication Required",
  [ErrorType.AUTHORIZATION]: "Access Denied",
  [ErrorType.NETWORK]: "Connection Problem",
  [ErrorType.NOT_FOUND]: "Not Found",
  [ErrorType.CONFLICT]: "Conflict",
  [ErrorType.INTERNAL]: "System Error",
  [ErrorType.BUSINESS_LOGIC]: "Action Not Allowed",
} as const; 