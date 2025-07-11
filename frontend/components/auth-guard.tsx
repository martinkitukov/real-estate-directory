'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredUserType?: 'buyer' | 'developer' | 'admin'
  fallbackPath?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredUserType,
  fallbackPath = '/' 
}: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, token, loadUser } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        // If auth is required but no token, redirect
        if (requireAuth && !token) {
          if (isMounted) {
            router.push(fallbackPath)
          }
          return
        }

        // If we have a token but no user data, try to load it
        if (token && !user) {
          await loadUser()
        }

        // Get current state after potential loadUser call
        const currentState = useAuthStore.getState()

        // If auth is required but not authenticated, redirect
        if (requireAuth && !currentState.isAuthenticated) {
          if (isMounted) {
            router.push(fallbackPath)
          }
          return
        }

        // Check user type requirements
        if (requiredUserType && currentState.user) {
          const userType = currentState.user.user_type
          
          if (requiredUserType === 'developer' && 
              userType !== 'developer' && 
              userType !== 'unverified_developer') {
            if (isMounted) {
              console.log('User type mismatch: required developer, got', userType)
              router.push(fallbackPath)
            }
            return
          }
          
          if (requiredUserType === 'buyer' && userType !== 'buyer') {
            if (isMounted) {
              console.log('User type mismatch: required buyer, got', userType)
              router.push(fallbackPath)
            }
            return
          }
          
          if (requiredUserType === 'admin' && userType !== 'admin') {
            if (isMounted) {
              console.log('User type mismatch: required admin, got', userType)
              router.push(fallbackPath)
            }
            return
          }
        }

        // All checks passed
        if (isMounted) {
          setIsAuthorized(true)
          setIsChecking(false)
        }
      } catch (error) {
        console.error('Auth guard check failed:', error)
        if (isMounted) {
          router.push(fallbackPath)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [token, user, isAuthenticated, requireAuth, requiredUserType, fallbackPath, router, loadUser])

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
} 