import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, User, AuthTokens } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  registerBuyer: (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) => Promise<boolean>
  registerDeveloper: (userData: {
    email: string
    password: string
    company_name: string
    contact_person?: string
    phone?: string
    address?: string
    website?: string
  }) => Promise<boolean>
  logout: () => void
  loadUser: () => Promise<void>
  clearError: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClient.login(email, password)
          
          if (response.error) {
            const errorMessage = typeof response.error === 'string' ? response.error : 'Login failed'
            set({ error: errorMessage, isLoading: false })
            return false
          }

          if (response.data) {
            const { access_token } = response.data
            apiClient.setToken(access_token)
            
            // Get user info
            const userResponse = await apiClient.getCurrentUser()
            if (userResponse.data) {
              set({
                token: access_token,
                user: userResponse.data,
                isAuthenticated: true,
                isLoading: false,
                error: null
              })
              return true
            }
          }
          
          set({ error: 'Failed to get user information', isLoading: false })
          return false
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          })
          return false
        }
      },

      registerBuyer: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClient.registerBuyer(userData)
          
          if (response.error) {
            const errorMessage = typeof response.error === 'string' ? response.error : 'Registration failed'
            set({ error: errorMessage, isLoading: false })
            return false
          }

          if (response.data) {
            // Auto-login after successful registration
            const loginSuccess = await get().login(userData.email, userData.password)
            return loginSuccess
          }
          
          return false
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed', 
            isLoading: false 
          })
          return false
        }
      },

      registerDeveloper: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClient.registerDeveloper(userData)
          
          if (response.error) {
            const errorMessage = typeof response.error === 'string' ? response.error : 'Registration failed'
            set({ error: errorMessage, isLoading: false })
            return false
          }

          if (response.data) {
            // Auto-login after successful registration
            const loginSuccess = await get().login(userData.email, userData.password)
            return loginSuccess
          }
          
          return false
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed', 
            isLoading: false 
          })
          return false
        }
      },

      logout: () => {
        apiClient.setToken(null)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      loadUser: async () => {
        const state = get()
        const token = state.token
        if (!token) {
          // No token, ensure clean state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          return
        }

        set({ isLoading: true, error: null })
        apiClient.setToken(token)
        
        try {
          const response = await apiClient.getCurrentUser()
          
          if (response.error || !response.data) {
            // Token is invalid or no user data, logout
            console.log('Failed to load user, logging out:', response.error)
            get().logout()
            return
          }

          // Successfully loaded user
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          console.error('Error loading user:', error)
          // Only logout if it's a genuine auth error, not a network error
          if (error instanceof Error && error.message.includes('Not authenticated')) {
            get().logout()
          } else {
            // Network error - keep auth state but show error
            set({ 
              isLoading: false,
              error: 'Failed to verify authentication. Please check your connection.'
            })
          }
        }
      },

      clearError: () => set({ error: null }),

      // Initialize auth from stored state
      initialize: () => {
        const state = get()
        if (state.token) {
          apiClient.setToken(state.token)
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // Set token in API client when state is rehydrated from localStorage
        if (state?.token) {
          apiClient.setToken(state.token)
        }
      }
    }
  )
) 