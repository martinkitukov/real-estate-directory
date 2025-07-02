import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/api'

// Custom hook for authentication actions
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    registerBuyer,
    registerDeveloper,
    logout,
    clearError
  } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const success = await login(email, password)
      if (!success) {
        throw new Error(error || 'Login failed')
      }
      return success
    },
    onSuccess: () => {
      clearError()
    }
  })

  // Register buyer mutation
  const registerBuyerMutation = useMutation({
    mutationFn: async (userData: {
      email: string
      password: string
      first_name: string
      last_name: string
    }) => {
      const success = await registerBuyer(userData)
      if (!success) {
        throw new Error(error || 'Registration failed')
      }
      return success
    },
    onSuccess: () => {
      clearError()
    }
  })

  // Register developer mutation
  const registerDeveloperMutation = useMutation({
    mutationFn: async (userData: {
      email: string
      password: string
      company_name: string
      contact_person?: string
      phone?: string
      address?: string
      website?: string
    }) => {
      const success = await registerDeveloper(userData)
      if (!success) {
        throw new Error(error || 'Registration failed')
      }
      return success
    },
    onSuccess: () => {
      clearError()
    }
  })

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerBuyerMutation.isPending || registerDeveloperMutation.isPending,
    error: error || loginMutation.error?.message || registerBuyerMutation.error?.message || registerDeveloperMutation.error?.message,
    
    // Actions
    login: loginMutation.mutate,
    registerBuyer: registerBuyerMutation.mutate,
    registerDeveloper: registerDeveloperMutation.mutate,
    logout,
    clearError
  }
}

// Hook for fetching current user (with React Query caching)
export function useCurrentUser() {
  const { isAuthenticated, token } = useAuthStore()
  
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      const response = await apiClient.getCurrentUser()
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
} 