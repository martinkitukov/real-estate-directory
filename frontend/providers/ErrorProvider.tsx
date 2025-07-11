"use client"

/**
 * Error boundary and context provider for global error state management.
 * 
 * Following Single Responsibility Principle (SRP) - handles global error state and boundaries.
 * Following Dependency Inversion Principle (DIP) - depends on error abstractions.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorDisplay, SuccessDisplay } from '@/components/ui/error-display'

// Simplified error types to avoid circular dependencies
interface AppError {
  id: string
  message: string
  type?: 'validation' | 'authentication' | 'authorization' | 'network' | 'internal' | 'business_logic'
  severity?: 'info' | 'warning' | 'error' | 'critical'
  category?: 'user_input' | 'system' | 'network' | 'authentication' | 'permission'
  fieldErrors?: Record<string, string>
  retryable?: boolean
  timestamp: Date
}

interface ErrorState {
  errors: AppError[]
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    timestamp: Date
  }>
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' | 'warning' | 'info' } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }

interface ErrorContextType {
  state: ErrorState
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void
  removeError: (id: string) => void
  clearErrors: () => void
  addNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  hasErrors: boolean
  getErrorsByType: (type: AppError['type']) => AppError[]
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      // Prevent duplicate errors
      const existingError = state.errors.find(
        error => error.message === action.payload.message && error.type === action.payload.type
      )
      if (existingError) {
        return state
      }
      return {
        ...state,
        errors: [...state.errors, action.payload]
      }
    
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      }
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      }
    
    case 'ADD_NOTIFICATION':
      const notification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        ...action.payload,
        timestamp: new Date()
      }
      return {
        ...state,
        notifications: [...state.notifications, notification]
      }
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload)
      }
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      }
    
    default:
      return state
  }
}

const initialState: ErrorState = {
  errors: [],
  notifications: []
}

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(errorReducer, initialState)

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const fullError: AppError = {
      ...error,
      id: `error-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }
    dispatch({ type: 'ADD_ERROR', payload: fullError })
  }, [])

  const removeError = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id })
  }, [])

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } })
  }, [])

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }, [])

  const hasErrors = state.errors.length > 0

  const getErrorsByType = useCallback((type: AppError['type']) => {
    return state.errors.filter(error => error.type === type)
  }, [state.errors])

  const contextValue: ErrorContextType = {
    state,
    addError,
    removeError,
    clearErrors,
    addNotification,
    removeNotification,
    clearNotifications,
    hasErrors,
    getErrorsByType
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error('Error caught by boundary:', error, errorInfo)
          addError({
            message: 'An unexpected error occurred. Please refresh the page.',
            type: 'internal',
            severity: 'critical',
            category: 'system'
          })
        }}
      >
        {children}
        <ErrorNotifications />
      </ErrorBoundary>
    </ErrorContext.Provider>
  )
}

// Error fallback component for error boundary
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-6">
        <ErrorDisplay
          error={{
            message: 'Something went wrong. Please try refreshing the page.',
            type: 'internal',
            severity: 'critical',
            category: 'system'
          }}
          onRetry={resetErrorBoundary}
          variant="banner"
        />
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

// Component to display notifications
function ErrorNotifications() {
  const { state, removeNotification } = useError()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {state.notifications.map((notification) => (
        <div key={notification.id}>
          {notification.type === 'success' ? (
            <SuccessDisplay
              message={notification.message}
              onDismiss={() => removeNotification(notification.id)}
            />
          ) : (
            <ErrorDisplay
              error={{
                message: notification.message,
                type: notification.type === 'error' ? 'internal' : 'validation',
                severity: notification.type === 'error' ? 'error' : 'warning'
              }}
              onDismiss={() => removeNotification(notification.id)}
              variant="banner"
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Hook to use error context
export function useError() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

// Hook for handling API errors
export function useApiError() {
  const { addError } = useError()

  const handleApiError = useCallback((error: any, context?: { operation?: string; url?: string }) => {
    // Map API errors to our error format
    if (error?.response?.status === 401) {
      addError({
        message: 'Your session has expired. Please log in again.',
        type: 'authentication',
        severity: 'error',
        category: 'authentication'
      })
    } else if (error?.response?.status === 403) {
      addError({
        message: "You don't have permission to perform this action.",
        type: 'authorization',
        severity: 'error',
        category: 'permission'
      })
    } else if (error?.response?.status >= 500) {
      addError({
        message: 'Server error occurred. Please try again later.',
        type: 'internal',
        severity: 'error',
        category: 'system'
      })
    } else if (error?.message?.includes('fetch')) {
      addError({
        message: 'Network error. Please check your connection.',
        type: 'network',
        severity: 'warning',
        category: 'network',
        retryable: true
      })
    } else {
      addError({
        message: error?.message || 'An unexpected error occurred.',
        type: 'internal',
        severity: 'error',
        category: 'system'
      })
    }
  }, [addError])

  return { handleApiError }
}

// Hook for form validation errors
export function useFormError() {
  const { addError, removeError } = useError()

  const setFieldError = useCallback((field: string, message: string) => {
    addError({
      message: `Validation error in ${field}`,
      type: 'validation',
      severity: 'warning',
      category: 'user_input',
      fieldErrors: { [field]: message }
    })
  }, [addError])

  const clearFieldError = useCallback((field: string) => {
    // This is a simplified implementation
    // In a real app, you'd want to track field errors separately
  }, [])

  return { setFieldError, clearFieldError }
} 