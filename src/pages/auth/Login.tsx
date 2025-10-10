import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import api from '../../lib/apiClient'
import { useAppDispatch, useAppSelector } from '../../store'
import { loginFailed, loginSuccess } from '../../store/authSlice'
import { allowList, validateAllowList } from '../../lib/validation'
import { useNotifications } from '../../components/NotificationsProvider'

import AuthLayout from '../../app/AuthLayout'
import { Link as RouterLink } from 'react-router-dom'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'

// Task 2 Compliant: Zod schema for login form validation
const loginSchema = z.object({
  usernameOrEmail: z.string()
    .min(1, 'Username or email is required')
    .regex(/^[a-zA-Z0-9@._-]+$/, 'Invalid characters in username/email'),
  accountNumber: z.string()
    .min(6, 'Account number must be at least 6 digits')
    .max(18, 'Account number must not exceed 18 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 'Password must contain uppercase, lowercase, number, and special character'),
  otp: z.string().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const dispatch = useAppDispatch()
  const { nextAllowedLoginAt } = useAppSelector((s) => s.auth)
  const [error, setError] = useState<string | null>(null)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [hasEmail, setHasEmail] = useState<boolean | null>(null)
  const [tempEmail, setTempEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { notify } = useNotifications()

  const canAttempt = !nextAllowedLoginAt || Date.now() >= nextAllowedLoginAt

  // Task 2 Compliant: react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  // const watchedValues = watch() // Available for future use

  const sendOtp = async () => {
    if (!tempEmail || !userId) {
      setError('Please enter a valid email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(tempEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setSendingOtp(true)
    setError(null)

    try {
      const res = await api.post('/auth/send-otp', {
        email: tempEmail,
        userId: userId
      })

      if (res.data?.success) {
        setOtpSent(true)
        notify({ severity: 'success', message: res.data.message || 'OTP sent to your email' })
      } else {
        setError(res.data?.message || 'Failed to send OTP')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to send OTP'
      setError(msg)
    } finally {
      setSendingOtp(false)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    if (!canAttempt) return
    
    // Additional allowlist validation for account number
    const normalizedAccount = (data.accountNumber || '').replace(/\s/g, '').trim()
    if (!validateAllowList(normalizedAccount, allowList.accountNumber)) {
      return setError('Invalid account number format.')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const payload: any = {
        usernameOrEmail: (data.usernameOrEmail || '').trim(),
        accountNumber: normalizedAccount,
        password: (data.password || '').trim(),
      }

      // Add OTP if in OTP verification phase
      if (mfaRequired && data.otp) {
        payload.otp = data.otp
      }
      
      // If user entered an email for OTP (no registered email), include it
      if (tempEmail) {
        payload.email = tempEmail
      }

      const res = await api.post('/auth/login', payload)
      
      if (res.data?.data?.mfa === 'required') {
        setMfaRequired(true)
        setHasEmail(res.data?.data?.hasEmail ?? null)
        setUserId(res.data?.data?.user?.id || null)
        
        // Show appropriate message based on hasEmail status
        if (res.data?.data?.hasEmail) {
          notify({ severity: 'info', message: res.data.message || 'OTP sent to your registered email' })
        }
      } else {
        // Determine if this is a first login (account created today)
        const userPayload = res.data?.data?.user
        const createdAt = new Date(userPayload?.createdAt)
        const now = new Date()
        const isFirstLogin = createdAt.toDateString() === now.toDateString()

        ;(window as any).__nexuspay_isAuthed = true
        const accessToken: string | undefined = res.data?.data?.accessToken
        // const refreshToken: string | undefined = res.data?.data?.refreshToken // Stored in AuthSlice
        if (accessToken) {
          const { setAuthToken } = await import('../../lib/apiClient')
          setAuthToken(accessToken)
        }
        dispatch(loginSuccess({ 
          user: userPayload,
          isFirstLogin 
        }))
        
        if (res.data?.data?.unknownDevice) {
          notify({ severity: 'warning', message: 'Login from unknown device detected' })
        }
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Invalid credentials'
      setError(msg)
      dispatch(loginFailed())
    } finally {
      setLoading(false)
    }
  }

  const handleDemoCredentials = () => {
    setValue('usernameOrEmail', 'test@nexuspay.dev', { shouldValidate: true, shouldDirty: true })
    setValue('accountNumber', '12345678', { shouldValidate: true, shouldDirty: true })
    setValue('password', 'TestPass123!', { shouldValidate: true, shouldDirty: true })
  }

  return (
    <AuthLayout title="Login">
      <Typography variant="subtitle1" color="text.secondary" gutterBottom align="center">Secure access to your NexusPay account</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!canAttempt && (
        <Alert severity="info">Please wait before trying again.</Alert>
      )}
      <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
        <TextField 
          label="Username or Email" 
          {...register('usernameOrEmail')}
          error={!!errors.usernameOrEmail}
          helperText={errors.usernameOrEmail?.message}
          required 
          autoComplete="username"
          inputProps={{ autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false }}
        />
        <TextField 
          label="Account Number" 
          {...register('accountNumber')}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber?.message}
          required 
          autoComplete="off"
          inputProps={{ inputMode: 'numeric', pattern: '\\d*', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false }}
        />
        <TextField 
          type={showPassword ? 'text' : 'password'}
          label="Password" 
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          required
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {mfaRequired && hasEmail === false && !otpSent && (
          <Stack direction="row" spacing={1}>
            <TextField 
              label="Email for OTP" 
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              error={!!error && !otpSent}
              helperText="Enter your email to receive the OTP code"
              required 
              fullWidth
              type="email"
              autoComplete="email"
            />
            <Button 
              variant="contained" 
              onClick={sendOtp}
              disabled={!tempEmail || sendingOtp}
              sx={{ minWidth: '120px', whiteSpace: 'nowrap' }}
            >
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </Button>
          </Stack>
        )}
        {mfaRequired && (hasEmail === true || otpSent) && (
          <TextField 
            label="OTP" 
            {...register('otp')}
            error={!!errors.otp}
            helperText={errors.otp?.message || 'Enter the 6-digit code sent to your email'}
            required 
            autoComplete="one-time-code"
            inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 6 }}
          />
        )}
        {import.meta.env.DEV && (
          <Box>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleDemoCredentials}
              type="button"
            >
              Use demo credentials
            </Button>
          </Box>
        )}
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!canAttempt || loading || !isValid || (mfaRequired && hasEmail === false && !otpSent)}
        >
          {loading ? 'Signing in...' : mfaRequired ? 'Verify OTP & Login' : 'Continue'}
        </Button>
        <Typography variant="body2" align="center">
          New to NexusPay? <Link component={RouterLink} to="/register">Create an account</Link>
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Staff member? <Link component={RouterLink} to="/staff-login">Staff Portal Access</Link>
        </Typography>
      </Stack>
    </AuthLayout>
  )
}


