import { useEffect, useState, useRef, createContext, useContext } from 'react'
import { useAppDispatch } from '../store'
import { loginSuccess, logout } from '../store/authSlice'
import { CircularProgress, Box, Typography } from '@mui/material'
import api from '../lib/apiClient'

interface AuthProviderProps {
  children: React.ReactNode
}

interface AuthContextType {
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false })

export const useAuthInitialized = () => useContext(AuthContext)

/**
 * AuthProvider - Handles authentication state restoration on app load
 * Checks if user has valid token in localStorage and restores Redux state
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    // Ensure this only runs once
    if (hasRun.current) {
      return
    }
    hasRun.current = true

    const initializeAuth = async () => {
      try {
        // Check if we have stored user data and token
        const storedUser = localStorage.getItem('np_user')
        const storedToken = localStorage.getItem('np_access_token')

        if (storedUser && storedToken) {
          // Parse stored user data
          const user = JSON.parse(storedUser)
          
          // Verify token is still valid by calling /auth/me
          try {
            const response = await api.get('/auth/me')
            
            if (response.data?.success && response.data?.data?.user) {
              // Token is valid, restore auth state
              const serverUser = response.data.data.user
              
              dispatch(loginSuccess({
                user: {
                  id: serverUser.id,
                  fullName: serverUser.fullName,
                  email: serverUser.email,
                  role: serverUser.role,
                  createdAt: serverUser.createdAt,
                },
                isFirstLogin: false,
              }))
              
              // Update stored user data with latest from server
              localStorage.setItem('np_user', JSON.stringify(serverUser))
              
              console.log('✅ Auth state restored from localStorage')
            } else {
              // Invalid response, clear auth
              handleAuthFailure()
            }
          } catch (error: any) {
            // Token expired or invalid
            console.warn('⚠️ Token validation failed:', error?.response?.status)
            handleAuthFailure()
          }
        } else {
          // No stored credentials
          console.log('ℹ️ No stored credentials found')
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        handleAuthFailure()
      } finally {
        // Always mark as initialized, even on error
        setIsInitialized(true)
      }
    }

    const handleAuthFailure = () => {
      // Clear everything on auth failure
      localStorage.removeItem('np_user')
      localStorage.removeItem('np_access_token')
      dispatch(logout())
    }

    initializeAuth()
  }, [])

  // Show loading screen while initializing auth
  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          Loading NexusPay...
        </Typography>
      </Box>
    )
  }

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  )
}

