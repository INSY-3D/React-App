import axios, { type AxiosAdapter } from 'axios'
import { getCsrfToken } from './csrf'

const DEV = import.meta.env.DEV
const MOCK = (import.meta.env.VITE_MOCK_API as string) === 'true'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:5118'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send HttpOnly cookie
  headers: {
    'Content-Type': 'application/json',
  },
  // Only allow HTTPS endpoints in production
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
    const url = error?.config?.url
    
    if (status === 401 || status === 403) {
      // Don't call logout if the failing request IS the logout endpoint (prevents infinite loop)
      if (!url?.endsWith('/logout')) {
        try {
          // Attempt best-effort logout endpoint
          await api.post('/api/v1/logout').catch(() => {})
        } catch {
          // Ignore logout failures
        }
      }
      
      // Always emit logout event to clear local state
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(error)
  },
)

api.interceptors.request.use((config) => {
  const token = getCsrfToken()
  if (token && config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = token
  }
  return config
})

// Mock adapter for local development/testing
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
    // Parse body if provided
    let body: any
    try { body = typeof data === 'string' ? JSON.parse(data) : data } catch { body = data }

    await new Promise((r) => setTimeout(r, 300))

    if (url.endsWith('/api/v1/csrf') && method === 'get') {
      return respond(200, { token: 'mock-csrf-token' })
    }
    if (url.endsWith('/api/v1/login') && method === 'post') {
      const { usernameOrEmail, accountNumber, password, otp } = body || {}
      // Demo credentials
      const ok = usernameOrEmail && accountNumber === '1234567890' && password === 'DevPassw0rd!2025'
      if (!ok) {
        return respond(401, { message: 'Invalid credentials' })
      }
      if (!otp && usernameOrEmail !== 'test@nexuspay.dev') {
        return respond(200, { mfa: 'required' })
      }
      return respond(200, { displayName: 'Dev User', unknownDevice: false })
    }
    if (url.endsWith('/api/v1/register') && method === 'post') {
      return respond(200, { ok: true })
    }
    if (url.endsWith('/api/v1/logout') && method === 'post') {
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
    // Default: not found
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


