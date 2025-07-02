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
            set({ error: response.error, isLoading: false })
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
            set({ error: response.error, isLoading: false })
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
            set({ error: response.error, isLoading: false })
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
        const token = get().token
        if (!token) return

        set({ isLoading: true })
        apiClient.setToken(token)
        
        try {
          const response = await apiClient.getCurrentUser()
          
          if (response.error) {
            // Token is invalid, logout
            get().logout()
            return
          }

          if (response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false
            })
          }
        } catch (error) {
          get().logout()
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 