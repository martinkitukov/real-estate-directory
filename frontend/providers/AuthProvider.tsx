'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, initialize } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        // Initialize auth store and set token in API client
        initialize()
        
    // Load user data on app initialization
        await loadUser()
        
        if (isMounted) {
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setIsInitialized(true) // Still mark as initialized even if error
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, []) // Remove dependencies to avoid re-running

  // Don't render children until auth is initialized to prevent auth state flicker
  if (!isInitialized) {
    return null
  }

  return <>{children}</>
} 