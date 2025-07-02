'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    // Load user data on app initialization
    loadUser()
  }, [loadUser])

  return <>{children}</>
} 