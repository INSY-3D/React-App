import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  isAuthenticated: boolean
  user?: {
    id: string
    fullName: string
    email?: string
    role: string
    createdAt: string
  }
  isFirstLogin?: boolean
  failedAttempts: number
  nextAllowedLoginAt?: number
}

const initialState: AuthState = {
  isAuthenticated: false,
  failedAttempts: 0,
}

const BASE_DELAY_MS = 1000

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ 
      user: {
        id: string
        fullName: string
        email?: string
        role: string
        createdAt: string
      }
      isFirstLogin?: boolean
    }>) {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.isFirstLogin = action.payload.isFirstLogin
      state.failedAttempts = 0
      state.nextAllowedLoginAt = undefined
    },
    loginFailed(state) {
      state.isAuthenticated = false
      state.failedAttempts += 1
      const delay = Math.min(BASE_DELAY_MS * state.failedAttempts, 15000)
      state.nextAllowedLoginAt = Date.now() + delay
    },
    logout(state) {
      state.isAuthenticated = false
      state.user = undefined
      state.isFirstLogin = undefined
    },
  },
})

export const { loginSuccess, loginFailed, logout } = authSlice.actions
export default authSlice.reducer


