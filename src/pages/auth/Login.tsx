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
  const [loading, setLoading] = useState(false)
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

  const onSubmit = async (data: LoginFormData) => {
    if (!canAttempt) return
    
    // Additional allowlist validation for account number
    if (!validateAllowList(data.accountNumber, allowList.accountNumber)) {
      return setError('Invalid account number format.')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await api.post('/api/v1/login', {
        usernameOrEmail: data.usernameOrEmail,
        accountNumber: data.accountNumber,
        password: data.password,
        otp: mfaRequired ? data.otp : undefined,
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

  const handleDemoCredentials = () => {
    setValue('usernameOrEmail', 'test@nexuspay.dev', { shouldValidate: true, shouldDirty: true })
    setValue('accountNumber', '1234567890', { shouldValidate: true, shouldDirty: true })
    setValue('password', 'DevPassw0rd!2025', { shouldValidate: true, shouldDirty: true })
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
        />
        <TextField 
          label="Account Number" 
          {...register('accountNumber')}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber?.message}
          required 
        />
        <TextField 
          type={showPassword ? 'text' : 'password'}
          label="Password" 
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          required
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
        {mfaRequired && (
          <TextField 
            label="OTP" 
            {...register('otp')}
            error={!!errors.otp}
            helperText={errors.otp?.message || 'Enter the 6-digit code from your authenticator app'}
            required 
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
          disabled={!canAttempt || loading || !isValid}
        >
          {mfaRequired ? 'Verify & Login' : 'Login'}
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


