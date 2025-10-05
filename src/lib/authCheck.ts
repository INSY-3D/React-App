import api from './apiClient'

export interface AuthCheckResponse {
  isAuthenticated: boolean
  user?: {
    id: string
    fullName: string
    email?: string
    role: string
    createdAt: string
  }
  csrfToken?: string
}

/**
 * Task 2 Compliant: HttpOnly Cookie Authentication Check
 * Verifies authentication status using HttpOnly cookies instead of Bearer tokens
 */
export async function checkAuthStatus(): Promise<AuthCheckResponse> {
  try {
    const response = await api.get('/api/v1/auth/status')
    return {
      isAuthenticated: true,
      user: response.data.user,
      csrfToken: response.data.csrfToken
    }
  } catch (error: any) {
    // 401/403 responses indicate user is not authenticated
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return { isAuthenticated: false }
    }
    
    // For other errors, assume network issues but don't force logout
    console.warn('Auth status check failed:', error.message)
    return { isAuthenticated: false }
  }
}

/**
 * Performs logout by calling the logout endpoint
 * This clears the HttpOnly cookies on the server side
 */
export async function performLogout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    // Even if logout fails, we still want to clear local state
    console.warn('Logout request failed:', error)
  }
}

/**
 * Refreshes the authentication session
 * Extends the HttpOnly cookie expiration
 */
export async function refreshAuth(): Promise<AuthCheckResponse> {
  try {
    const response = await api.post('/api/v1/auth/refresh')
    return {
      isAuthenticated: true,
      user: response.data.user,
      csrfToken: response.data.csrfToken
    }
  } catch (error) {
    return { isAuthenticated: false }
  }
}
