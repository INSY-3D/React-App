import axios, { type AxiosAdapter } from 'axios'
import { getCsrfToken } from './csrf'

const DEV = import.meta.env.DEV
const MOCK = (import.meta.env.VITE_MOCK_API as string) === 'true'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:5118/api/v1'

const TOKEN_STORAGE_KEY = 'np_access_token'
let bearerToken: string | null = null

export function setAuthToken(token: string | null) {
  bearerToken = token
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {}
  if (DEV) console.log('Auth token set?', !!token)
}

export function initializeAuthTokenFromStorage() {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) bearerToken = stored
  } catch {}
  if (DEV) console.log('Auth token initialized from storage?', !!bearerToken)
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [
    (data) => {
      if (!API_BASE_URL.startsWith('https://') && !MOCK && !DEV) {
        throw new Error('API must use HTTPS (TLS 1.3).')
      }
      return JSON.stringify(data)
    },
  ],
})

let last401At = 0

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    // Only clear token on 401 (unauthenticated). Do not clear on 403 (forbidden).
    if (status === 401 && bearerToken) {
      // Throttle clearing to avoid race conditions during navigation/first load
      const now = Date.now()
      const url: string = (error?.config?.baseURL || API_BASE_URL) + (error?.config?.url || '')
      const fromOurApi = url.startsWith(API_BASE_URL)
      if (fromOurApi) {
        if (now - last401At < 5000) {
          if (DEV) console.warn('Repeated 401 within 5s. Clearing token.')
          bearerToken = null
          try { localStorage.removeItem(TOKEN_STORAGE_KEY) } catch {}
          ;(window as any).__nexuspay_isAuthed = false
        } else {
          if (DEV) console.warn('First 401 detected. Not clearing token (will clear on repeat).')
          last401At = now
        }
      }
    }
    return Promise.reject(error)
  },
)

api.interceptors.request.use((config) => {
  if (bearerToken) {
    config.headers['Authorization'] = `Bearer ${bearerToken}`
  }
  if (DEV) {
    console.debug('Request', {
      url: config.url,
      method: config.method,
      hasAuthHeader: !!config.headers['Authorization'],
    })
  }
  const token = getCsrfToken()
  if (token && config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = token
  }
  return config
})

if (MOCK) {
  const mockAdapter: AxiosAdapter = async (config) => {
    const { url = '', method = 'get', data } = config
    const respond = (status: number, payload: any) => ({
      data: payload,
      status,
      statusText: String(status),
      headers: {},
      config,
    })
    let body: any
    try { body = typeof data === 'string' ? JSON.parse(data) : data } catch { body = data }

    await new Promise((r) => setTimeout(r, 300))

    if (url.endsWith('/csrf') && method === 'get') {
      return respond(200, { success: true, data: { token: 'mock-csrf-token' } })
    }
    if (url.endsWith('/auth/login') && method === 'post') {
      const { usernameOrEmail, accountNumber, password, otp } = body || {}
      const ok = usernameOrEmail && accountNumber === '12345678' && password === 'TestPass123!'
      if (!ok) {
        return respond(401, { success: false, message: 'Invalid credentials', code: 'LOGIN_FAILED' })
      }
      if (!otp && usernameOrEmail !== 'test@nexuspay.dev') {
        return respond(200, { success: true, message: 'MFA required', data: { mfa: 'required', user: { id: '1', fullName: 'Test User', role: 'customer' } } })
      }
      ;(window as any).__nexuspay_isAuthed = true
      setAuthToken('mock-access-token')
      return respond(200, { 
        success: true, 
        message: 'Login successful',
        data: {
          user: { id: '1', fullName: 'Test User', role: 'customer', createdAt: new Date().toISOString() },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: '15m',
          unknownDevice: false
        }
      })
    }
    if (url.endsWith('/auth/register') && method === 'post') {
      return respond(201, { success: true, message: 'Registration successful' })
    }
    if (url.endsWith('/auth/logout') && method === 'post') {
      ;(window as any).__nexuspay_isAuthed = false
      setAuthToken(null)
      return respond(200, { success: true, message: 'Logout successful' })
    }
    if (url.endsWith('/payments') && method === 'post') {
      const { amount, currency, provider, idempotencyKey } = body || {}
      if (!amount || !currency || !provider || !idempotencyKey) {
        return respond(400, { success: false, message: 'Missing required payment fields', code: 'PAYMENT_CREATION_FAILED' })
      }
      const paymentId = 'P-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      return respond(201, { 
        success: true,
        message: 'Draft payment created successfully',
        data: {
          paymentId, 
          status: 'draft',
          estimatedProcessingTime: 'Add beneficiary details to proceed'
        }
      })
    }
    return respond(404, { message: 'Mock route not found' })
  }
  api.defaults.adapter = mockAdapter
}

console.log('API Configuration:', {
  baseURL: API_BASE_URL,
  mock: MOCK,
  dev: DEV
})

export default api


