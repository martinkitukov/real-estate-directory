// API Client for NovaDom Backend Communication

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface AuthTokens {
  access_token: string
  token_type: string
  expires_in: number
  user_type: string
}

export interface User {
  id: number
  email: string
  user_type: string
  first_name?: string
  last_name?: string
  company_name?: string
  verification_status?: string
  created_at: string
}

const API_BASE_URL = 'http://localhost:8000/api/v1'

// Types matching backend schemas
export interface ProjectType {
  id: number
  developer_id: number
  title: string
  description?: string
  location_text: string
  city: string
  neighborhood?: string
  country: string
  project_type: 'apartment_building' | 'house_complex'
  status: 'planning' | 'under_construction' | 'completed'
  expected_completion_date?: string
  cover_image_url?: string
  gallery_urls?: string[]
  amenities_list?: string[]
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
  is_active: boolean
  is_verified: boolean
}

export interface ProjectListResponse {
  projects: ProjectType[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ProjectCreateData {
  title: string
  description?: string
  location_text: string
  city: string
  neighborhood?: string
  country?: string
  project_type: 'apartment_building' | 'house_complex'
  status: 'planning' | 'under_construction' | 'completed'
  expected_completion_date?: string
  cover_image_url?: string
  gallery_urls?: string[]
  amenities_list?: string[]
  latitude?: number
  longitude?: number
}

export interface ProjectSearchParams {
  search?: string
  city?: string
  project_type?: string
  status?: string
  page?: number
  per_page?: number
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  setToken(token: string | null) {
    this.token = token
  }

  private isGenericBackendMessage(message: string): boolean {
    const genericMessages = [
      'internal server error',
      'bad request', 
      'unauthorized',
      'forbidden',
      'not found',
      'validation error',
      'request failed'
    ]
    
    const lowerMessage = message.toLowerCase()
    return genericMessages.some(generic => lowerMessage.includes(generic))
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only set Content-Type for JSON requests, not for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      console.log(`Making API request to: ${url}`)
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError)
        }
        
        console.error(`API Error ${response.status} for ${url}:`, errorData)
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          let errorMessage = 'Invalid email or password. Please check your credentials and try again.'
          
          // Try to get specific error message from backend
          if (errorData.message) {
            errorMessage = errorData.message
          }
          
          // Only clear auth state for endpoints that require authentication (not login attempts)
          const isLoginAttempt = endpoint.includes('/auth/token') || endpoint.includes('/auth/login')
          const isAuthEndpoint = endpoint.includes('/auth/') || 
                                 endpoint.includes('/developers/') ||
                                 this.token !== null
          
          if (isAuthEndpoint && this.token && !isLoginAttempt) {
            console.log('Authentication failed for endpoint:', endpoint)
            
            // Clear token and trigger logout for authenticated requests (not login failures)
            this.setToken(null)
            
            // Trigger auth store logout if available
            if (typeof window !== 'undefined') {
              // Use dynamic import to avoid circular dependency
              import('@/stores/authStore').then(({ useAuthStore }) => {
                useAuthStore.getState().logout()
              }).catch(() => {
                // Fallback: clear localStorage directly
                localStorage.removeItem('auth-storage')
              })
              
              // Only redirect if we're not already on the home page
              if (window.location.pathname !== '/') {
                // Small delay to allow auth state to clear
                setTimeout(() => {
                  window.location.href = '/'
                }, 100)
              }
            }
            
            errorMessage = 'Your session has expired. Please log in again.'
          }
          
          throw new Error(errorMessage)
        }
        
        // Handle FastAPI validation errors (422)
        if (response.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail
            .map((err: any) => {
              if (typeof err === 'object' && err.msg) {
                // Map common validation errors to user-friendly messages
                const msg = err.msg.toLowerCase()
                if (msg.includes('email') && msg.includes('valid')) {
                  return 'Please enter a valid email address.'
                }
                if (msg.includes('required')) {
                  return 'This field is required.'
                }
                return err.msg
              }
              return err.toString()
            })
            .join('. ')
          throw new Error(validationErrors)
        }
        
        // Handle other error formats with user-friendly messages
        let errorMessage = 'An unexpected error occurred. Please try again.'
        
        // Prefer backend message if it's user-friendly
        if (errorData.message && !this.isGenericBackendMessage(errorData.message)) {
          errorMessage = errorData.message
        } else if (typeof errorData.detail === 'string' && !this.isGenericBackendMessage(errorData.detail)) {
          errorMessage = errorData.detail
        } else {
          // Map status codes to user-friendly messages
          switch (response.status) {
            case 400:
              errorMessage = 'Invalid request. Please check your input and try again.'
              break
            case 403:
              errorMessage = "You don't have permission to perform this action."
              break
            case 404:
              errorMessage = 'The requested resource was not found.'
              break
            case 409:
              errorMessage = 'This item already exists. Please try with different information.'
              break
            case 429:
              errorMessage = 'Too many requests. Please wait a moment and try again.'
              break
            case 500:
              errorMessage = 'Server error occurred. Please try again later.'
              break
            case 502:
            case 503:
            case 504:
              errorMessage = 'Service temporarily unavailable. Please try again later.'
              break
            default:
              errorMessage = 'An unexpected error occurred. Please try again.'
          }
        }
        
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      
      // Handle network errors (CORS, connection refused, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to server. Please check if the backend is running.')
      }
      
      // Re-throw other errors as-is
      throw error
    }
  }

  // Project API methods
  async getProjects(params?: ProjectSearchParams): Promise<ProjectListResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/projects${queryString ? `?${queryString}` : ''}`
    
    return this.request<ProjectListResponse>(endpoint)
  }

  async getProject(projectId: number): Promise<ProjectType> {
    return this.request<ProjectType>(`/projects/${projectId}`)
  }

  async createProject(projectData: ProjectCreateData): Promise<ProjectType> {
    return this.request<ProjectType>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async updateProject(projectId: number, projectData: Partial<ProjectCreateData>): Promise<ProjectType> {
    return this.request<ProjectType>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })
  }

  async deleteProject(projectId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  // Auth methods (existing)
  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; token_type: string; user_type: string }>> {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const data = await this.request<{ access_token: string; token_type: string; user_type: string }>('/auth/token', {
        method: 'POST',
        body: formData,
      })

      return {
        data,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Login failed',
        status: 400
      }
    }
  }

  async registerBuyer(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }): Promise<ApiResponse<any>> {
    try {
      const data = await this.request('/auth/register/buyer', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      return {
        data,
        status: 201
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Registration failed',
        status: 400
      }
    }
  }

  async registerDeveloper(userData: {
      email: string;
      password: string;
      company_name: string;
      contact_person?: string;
      phone?: string;
      address?: string;
      website?: string
  }): Promise<ApiResponse<any>> {
    try {
      const data = await this.request('/auth/register/developer', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
      return {
        data,
        status: 201
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Registration failed',
        status: 400
      }
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const data = await this.request<User>('/auth/me')
      return {
        data,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to get user info',
        status: 401
      }
    }
  }

  // Developer-specific methods
  async getDeveloperProjects(params?: ProjectSearchParams): Promise<ApiResponse<ProjectListResponse>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString())
          }
        })
      }

      const queryString = searchParams.toString()
      const endpoint = `/developers/projects${queryString ? `?${queryString}` : ''}`
      
      const data = await this.request<ProjectListResponse>(endpoint)
      return {
        data,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch developer projects',
        status: 400
      }
    }
  }

  async getDeveloperStats(): Promise<ApiResponse<any>> {
    try {
      const data = await this.request<any>('/developers/stats')
      return {
        data,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch developer stats',
        status: 400
      }
    }
  }

  async getDeveloperAnalytics(period: string = 'week'): Promise<ApiResponse<any>> {
    try {
      const data = await this.request<any>(`/developers/analytics?period=${period}`)
      return {
        data,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch developer analytics',
        status: 400
      }
    }
  }

  async getDeveloperSubscription(): Promise<ApiResponse<any>> {
    try {
      const data = await this.request<any>('/developers/subscription')
      return {
        data,
        status: 200
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch subscription info',
        status: 400
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Helper function to convert backend project format to frontend format
export function convertBackendProject(backendProject: ProjectType): any {
  return {
    id: backendProject.id.toString(),
    title: backendProject.title,
    developer: `Developer ${backendProject.developer_id}`, // Would need to fetch developer name
    location: backendProject.neighborhood || backendProject.location_text,
    city: backendProject.city,
    projectType: backendProject.project_type === 'apartment_building' ? 'Apartment Building' : 'Housing Complex',
    status: backendProject.status === 'under_construction' ? 'Under Construction' : 
            backendProject.status === 'planning' ? 'Planning' : 'Completed',
    completionDate: backendProject.expected_completion_date || 'TBD',
    amenities: backendProject.amenities_list || [],
    imageUrl: backendProject.cover_image_url || "/placeholder.svg?height=240&width=400",
    price: "от €85,000", // Would need to be added to backend model
    pricePerSqm: "€1,200", // Would need to be added to backend model
    energyRating: "A", // Would need to be added to backend model
    act14Status: backendProject.is_verified,
    featured: backendProject.is_verified,
    image: backendProject.cover_image_url || "/placeholder.svg?height=240&width=400"
  }
} 