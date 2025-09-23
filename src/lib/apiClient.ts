import axios, { type AxiosAdapter } from 'axios'
import { getCsrfToken } from './csrf'

const DEV = import.meta.env.DEV
const MOCK = (import.meta.env.VITE_MOCK_API as string) === 'true'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:5118'

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    // Only clear token on 401 (unauthenticated). Do not clear on 403 (forbidden).
    if (status === 401 && bearerToken) {
      if (DEV) console.warn('Auth error received (401). Clearing token.')
      bearerToken = null
      try { localStorage.removeItem(TOKEN_STORAGE_KEY) } catch {}
      ;(window as any).__nexuspay_isAuthed = false
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

    if (url.endsWith('/api/v1/csrf') && method === 'get') {
      return respond(200, { token: 'mock-csrf-token' })
    }
    if (url.endsWith('/api/v1/login') && method === 'post') {
      const { usernameOrEmail, accountNumber, password, otp } = body || {}
      const ok = usernameOrEmail && accountNumber === '1234567890' && password === 'DevPassw0rd!2025'
      if (!ok) {
        return respond(401, { message: 'Invalid credentials' })
      }
      if (!otp && usernameOrEmail !== 'test@nexuspay.dev') {
        return respond(200, { mfa: 'required' })
      }
      ;(window as any).__nexuspay_isAuthed = true
      setAuthToken('mock-access-token')
      return respond(200, { displayName: 'Dev User', unknownDevice: false, user: { createdAt: new Date().toISOString() }, accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' })
    }
    if (url.endsWith('/api/v1/register') && method === 'post') {
      return respond(200, { ok: true })
    }
    if (url.endsWith('/api/v1/logout') && method === 'post') {
      ;(window as any).__nexuspay_isAuthed = false
      setAuthToken(null)
      return respond(200, { ok: true })
    }
    if (url.endsWith('/api/v1/payments') && method === 'post') {
      const { amount, currency, reference, purpose, fullName, swiftCode } = body || {}
      if (!amount || !currency || !reference || !purpose || !fullName || !swiftCode) {
        return respond(400, { message: 'Missing required payment fields' })
      }
      const paymentId = 'P-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      return respond(200, { 
        paymentId, 
        status: 'pending_verification',
        message: 'Payment submitted successfully' 
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


