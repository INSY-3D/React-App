import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import api from '../../lib/apiClient'
import { useAppDispatch, useAppSelector } from '../../store'
import { loginFailed, loginSuccess } from '../../store/authSlice'
import { allowList, validateAllowList } from '../../lib/validation'
import { useNotifications } from '../../components/NotificationsProvider'

import AuthLayout from '../../app/AuthLayout'
import { Link as RouterLink } from 'react-router-dom'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'

export default function Login() {
  const dispatch = useAppDispatch()
  const { nextAllowedLoginAt } = useAppSelector((s) => s.auth)
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [loading, setLoading] = useState(false)
  const { notify } = useNotifications()

  const canAttempt = !nextAllowedLoginAt || Date.now() >= nextAllowedLoginAt

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAttempt) return
    // allow-list validation
    if (!validateAllowList(accountNumber, allowList.accountNumber)) {
      return setError('Invalid account number.')
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/v1/login', {
        usernameOrEmail,
        accountNumber,
        password,
        otp: mfaRequired ? otp : undefined,
      })
      if (res.data?.mfa === 'required') {
        setMfaRequired(true)
      } else {
        // Determine if this is a first login (account created today)
        const createdAt = new Date(res.data?.user?.createdAt)
        const now = new Date()
        const isFirstLogin = createdAt.toDateString() === now.toDateString()

        dispatch(loginSuccess({ 
          user: res.data?.user,
          isFirstLogin 
        }))
        if (res.data?.unknownDevice) {
          notify({ severity: 'warning', message: 'Login from unknown device detected' })
        }
      }
    } catch {
      setError('Invalid credentials')
      dispatch(loginFailed())
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Login">
      <Typography variant="subtitle1" color="text.secondary" gutterBottom align="center">Secure access to your NexusPay account</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!canAttempt && (
        <Alert severity="info">Please wait before trying again.</Alert>
      )}
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField label="Username or Email" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} required />
        <TextField label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
        <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {mfaRequired && (
          <TextField label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        )}
        {import.meta.env.DEV && (
          <Box>
            <Button variant="outlined" size="small" onClick={() => {
              setUsernameOrEmail('test@nexuspay.dev')
              setAccountNumber('1234567890')
              setPassword('DevPassw0rd!2025')
            }}>Use demo credentials</Button>
          </Box>
        )}
        <Button type="submit" variant="contained" disabled={!canAttempt || loading}>
          {mfaRequired ? 'Verify & Login' : 'Login'}
        </Button>
        <Typography variant="body2" align="center">
          New to NexusPay? <Link component={RouterLink} to="/register">Create an account</Link>
        </Typography>
      </Stack>
    </AuthLayout>
  )
}


