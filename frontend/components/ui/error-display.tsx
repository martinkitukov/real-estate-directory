"use client"

/**
 * Error display components for consistent error UX across the application.
 * 
 * Following Single Responsibility Principle (SRP) - each component handles one type of error display.
 * Following Open/Closed Principle (OCP) - easy to extend with new error display variants.
 */

import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'
import { cn } from '@/lib/utils'

// Types for error display (simplified versions to avoid circular dependencies)
export interface DisplayError {
  message: string
  type?: 'validation' | 'authentication' | 'authorization' | 'network' | 'internal' | 'business_logic'
  severity?: 'info' | 'warning' | 'error' | 'critical'
  category?: 'user_input' | 'system' | 'network' | 'authentication' | 'permission'
  fieldErrors?: Record<string, string>
  retryable?: boolean
}

export interface ErrorDisplayProps {
  error: DisplayError
  onDismiss?: () => void
  onRetry?: () => void
  showDetails?: boolean
  variant?: 'inline' | 'banner' | 'modal' | 'toast'
  className?: string
}

/**
 * Gets the appropriate icon for an error based on its severity.
 */
function getErrorIcon(severity: string = 'error') {
  switch (severity) {
    case 'info':
      return Info
    case 'warning':
      return AlertTriangle
    case 'error':
      return AlertCircle
    case 'critical':
      return AlertCircle
    default:
      return AlertCircle
  }
}

/**
 * Gets the appropriate variant for the Alert component based on error severity.
 */
function getAlertVariant(severity: string = 'error'): 'default' | 'destructive' {
  switch (severity) {
    case 'info':
      return 'default'
    case 'warning':
      return 'default'
    case 'error':
    case 'critical':
      return 'destructive'
    default:
      return 'destructive'
  }
}

/**
 * Main error display component with customizable variants.
 */
export function ErrorDisplay({
  error,
  onDismiss,
  onRetry,
  showDetails = false,
  variant = 'inline',
  className
}: ErrorDisplayProps) {
  const Icon = getErrorIcon(error.severity)
  const alertVariant = getAlertVariant(error.severity)

  const canRetry = error.retryable && onRetry
  const canDismiss = onDismiss

  if (variant === 'banner') {
    return (
      <div className={cn(
        'border-l-4 p-4 mb-4',
        error.severity === 'error' || error.severity === 'critical' 
          ? 'bg-red-50 border-red-400' 
          : error.severity === 'warning'
          ? 'bg-yellow-50 border-yellow-400'
          : 'bg-blue-50 border-blue-400',
        className
      )}>
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={cn(
              'h-5 w-5',
              error.severity === 'error' || error.severity === 'critical' 
                ? 'text-red-400' 
                : error.severity === 'warning'
                ? 'text-yellow-400'
                : 'text-blue-400'
            )} />
          </div>
          <div className="ml-3 flex-1">
            <p className={cn(
              'text-sm font-medium',
              error.severity === 'error' || error.severity === 'critical' 
                ? 'text-red-800' 
                : error.severity === 'warning'
                ? 'text-yellow-800'
                : 'text-blue-800'
            )}>
              {error.message}
            </p>
            {error.fieldErrors && (
              <FieldErrorsList fieldErrors={error.fieldErrors} className="mt-2" />
            )}
          </div>
          <div className="ml-auto flex space-x-2">
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {canDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default inline variant
  return (
    <Alert variant={alertVariant} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Error</span>
        <div className="flex space-x-2">
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {canDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertTitle>
      <AlertDescription>
        {error.message}
        {error.fieldErrors && (
          <FieldErrorsList fieldErrors={error.fieldErrors} className="mt-2" />
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Component for displaying field-specific validation errors.
 */
export function FieldErrorsList({ 
  fieldErrors, 
  className 
}: { 
  fieldErrors: Record<string, string>
  className?: string 
}) {
  const errorEntries = Object.entries(fieldErrors)
  
  if (errorEntries.length === 0) {
    return null
  }

  return (
    <ul className={cn('text-sm space-y-1', className)}>
      {errorEntries.map(([field, message]) => (
        <li key={field} className="flex items-start">
          <span className="font-medium text-red-600 mr-2 capitalize">
            {field.replace(/[._]/g, ' ')}:
          </span>
          <span className="text-red-600">{message}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Inline field error component for form fields.
 */
export function FieldError({ 
  message, 
  className 
}: { 
  message?: string
  className?: string 
}) {
  if (!message) {
    return null
  }

  return (
    <p className={cn('text-sm text-red-600 mt-1', className)}>
      {message}
    </p>
  )
}

/**
 * Network error component with connection-specific messaging.
 */
export function NetworkErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className
}: Omit<ErrorDisplayProps, 'error'> & { error: DisplayError & { type: 'network' } }) {
  return (
    <div className={cn(
      'rounded-lg border border-orange-200 bg-orange-50 p-4',
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-orange-800">
            Connection Problem
          </h3>
          <div className="mt-2 text-sm text-orange-700">
            <p>{error.message}</p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-2">
              {onRetry && (
                <Button
                  size="sm"
                  onClick={onRetry}
                  variant="outline"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Authentication error component with login prompt.
 */
export function AuthErrorDisplay({
  error,
  onLogin,
  onDismiss,
  className
}: Omit<ErrorDisplayProps, 'error' | 'onRetry'> & { 
  error: DisplayError & { type: 'authentication' }
  onLogin?: () => void
}) {
  return (
    <div className={cn(
      'rounded-lg border border-blue-200 bg-blue-50 p-4',
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Authentication Required
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>{error.message}</p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-2">
              {onLogin && (
                <Button
                  size="sm"
                  onClick={onLogin}
                >
                  Sign In
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Success message component for positive feedback.
 */
export function SuccessDisplay({
  message,
  onDismiss,
  className
}: {
  message: string
  onDismiss?: () => void
  className?: string
}) {
  return (
    <div className={cn(
      'rounded-lg border border-green-200 bg-green-50 p-4',
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">
            {message}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 