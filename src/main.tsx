import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, GlobalStyles } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { Provider as ReduxProvider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { store } from './store'
import queryClient from './lib/queryClient'
// import '@fontsource-variable/inter' // Font will be loaded via CDN or system fonts
import theme from './theme'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationsProvider from './components/NotificationsProvider'
import api from './lib/apiClient'
import { setCsrfToken } from './lib/csrf'
import { logout } from './store/authSlice'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles styles={{
            'html, body, #root': { height: '100%' },
            body: {
              background: 'linear-gradient(135deg, #3B82F6 0%, #34D399 100%)',
            },
          }} />
          <BrowserRouter>
            <ErrorBoundary>
              <NotificationsProvider>
                <App />
              </NotificationsProvider>
            </ErrorBoundary>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  </StrictMode>,
)

// Bootstrap: fetch CSRF token and listen for forced logouts
;(async () => {
  try {
    const res = await api.get('/api/v1/csrf')
    if (res.data?.token) setCsrfToken(res.data.token)
  } catch {
    // ignore; token may be set later upon login
  }
})()

window.addEventListener('auth:logout', () => {
  store.dispatch(logout())
  if (location.pathname !== '/login') {
    location.replace('/session-timeout')
  }
})

// Runtime anti-clickjacking fallback in dev where meta CSP frame-ancestors is ignored
if (window.top !== window.self && window.top) {
  window.top.location.href = window.self.location.href
}
