import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { CssVarsProvider } from '@mui/material/styles'
import { Provider as ReduxProvider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { store } from './store'
import queryClient from './lib/queryClient'
// import '@fontsource-variable/inter'
import theme from './theme'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationsProvider from './components/NotificationsProvider'
import AuthProvider from './components/AuthProvider'
import api, { initializeAuthTokenFromStorage } from './lib/apiClient'
import { setCsrfToken } from './lib/csrf'
import { logout } from './store/authSlice'

initializeAuthTokenFromStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <CssVarsProvider theme={theme} defaultMode="light" modeStorageKey="np_theme">
          <CssBaseline />
          <BrowserRouter>
            <ErrorBoundary>
              <NotificationsProvider>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </NotificationsProvider>
            </ErrorBoundary>
          </BrowserRouter>
        </CssVarsProvider>
      </QueryClientProvider>
    </ReduxProvider>
  </StrictMode>,
)

// Bootstrap: fetch CSRF token and listen for forced logouts
;(async () => {
  try {
    const res = await api.get('/auth/csrf')
    if (res.data?.token) setCsrfToken(res.data.token)
  } catch {
    // ignore; token may be set later upon login
  }
})()

window.addEventListener('auth:logout', () => {
  store.dispatch(logout())
  // Redirect disabled temporarily during JWT wiring phase
})

// Runtime anti-clickjacking fallback in dev where meta CSP frame-ancestors is ignored
if (window.top !== window.self && window.top) {
  window.top.location.href = window.self.location.href
}
