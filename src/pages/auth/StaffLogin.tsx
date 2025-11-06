import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Chip,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material'
import {
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Badge as BadgeIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import api from '../../lib/apiClient'
import { useAppDispatch, useAppSelector } from '../../store'
import { loginFailed, loginSuccess } from '../../store/authSlice'
import { allowList, validateAllowList } from '../../lib/validation'
import { useNotifications } from '../../components/NotificationsProvider'
import AuthLayout from '../../app/AuthLayout'

// Task 2 Compliant: Enhanced validation for staff login
const staffLoginSchema = z.object({
  usernameOrEmail: z.string()
    .min(1, 'Username or email is required')
    .regex(/^[a-zA-Z0-9@._-]+$/, 'Invalid characters in username/email'),
  staffId: z.string()
    .min(3, 'Staff ID must be at least 3 characters')
    .max(20, 'Staff ID must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Staff ID must contain only uppercase letters, numbers, and hyphens'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  otp: z.string().optional()
})

type StaffLoginFormData = z.infer<typeof staffLoginSchema>

export default function StaffLogin() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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

  // Task 2 Compliant: react-hook-form with enhanced validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue
  } = useForm<StaffLoginFormData>({
    resolver: zodResolver(staffLoginSchema),
    mode: 'onChange'
  })

  const handleDemoCredentials = () => {
    setValue('usernameOrEmail', 'staff@nexuspay.dev', { shouldValidate: true, shouldDirty: true })
    setValue('staffId', '87654321', { shouldValidate: true, shouldDirty: true })
    setValue('password', 'StaffPass123!', { shouldValidate: true, shouldDirty: true })
  }

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

  const onSubmit = async (data: StaffLoginFormData) => {
    if (!canAttempt) return
    
    // Additional allowlist validation
    if (!validateAllowList(data.usernameOrEmail, allowList.email)) {
      return setError('Invalid username or email format.')
    }
    if (!validateAllowList(data.staffId, allowList.staffId)) {
      return setError('Invalid staff ID format.')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const payload: any = {
        usernameOrEmail: data.usernameOrEmail,
        accountNumber: data.staffId, // Staff ID maps to account number for backend
        password: data.password,
      }

      // Add OTP if in OTP verification phase
      if (mfaRequired && data.otp) {
        payload.otp = data.otp
        // If user doesn't have registered email, send the temp email for verification
        if (hasEmail === false && tempEmail) {
          payload.tempEmail = tempEmail
        }
      }

      const res = await api.post('/auth/staff-login', payload)
      
      if (res.data?.data?.mfa === 'required') {
        setMfaRequired(true)
        setHasEmail(res.data?.data?.hasEmail ?? null)
        setUserId(res.data?.data?.user?.id || null)
        
        // Show appropriate message based on hasEmail status
        if (res.data?.data?.hasEmail) {
          notify({ severity: 'info', message: res.data.message || 'OTP sent to your registered email' })
        }
      } else {
        // Set bearer token for subsequent staff API calls
        const accessToken: string | undefined = res.data?.data?.accessToken ?? res.data?.accessToken
        if (accessToken) {
          const { setAuthToken } = await import('../../lib/apiClient')
          ;(window as any).__nexuspay_isAuthed = true
          setAuthToken(accessToken)
        }
        
        // Staff users are never "first login"
        dispatch(loginSuccess({ 
          user: res.data?.data?.user ?? res.data?.user,
          isFirstLogin: false
        }))
        
        if (res.data?.data?.unknownDevice ?? res.data?.unknownDevice) {
          notify({ 
            severity: 'warning', 
            message: 'Staff login from unknown device detected - security event logged' 
          })
        }
        
        // Redirect to staff portal
        navigate('/staff', { replace: true })
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Invalid staff credentials'
      setError(errorMessage)
      dispatch(loginFailed())
      
      // Log security event for failed staff login
      notify({ 
        severity: 'error', 
        message: 'Staff login failed - security event logged' 
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <AuthLayout title="Staff Portal">
      <Box position="relative">
        <Box position="absolute" top={8} right={8}>
          <Button variant="text" size="small" onClick={() => navigate('/admin-login')}>
            Admin Login
          </Button>
        </Box>
      </Box>
      <Box textAlign="center" mb={3}>
        <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Staff Access
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Secure access to NexusPay staff portal for payment verification and administration
        </Typography>
        
        {/* Role indicators */}
        <Stack direction="row" spacing={1} justifyContent="center" mt={2} mb={3}>
          <Chip 
            icon={<BadgeIcon />} 
            label="Staff Verification" 
            color="primary" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            icon={<AdminIcon />} 
            label="Admin Functions" 
            color="secondary" 
            variant="outlined" 
            size="small" 
          />
        </Stack>
        
        <Divider />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!canAttempt && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Too many failed attempts. Please wait before trying again.
        </Alert>
      )}

      <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)}>
        <TextField 
          label="Username or Email" 
          {...register('usernameOrEmail')}
          error={!!errors.usernameOrEmail}
          helperText={errors.usernameOrEmail?.message}
          autoComplete="username"
          required 
        />
        
        <TextField 
          label="Staff ID" 
          {...register('staffId')}
          error={!!errors.staffId}
          helperText={errors.staffId?.message || 'Enter your assigned staff identifier (e.g., STAFF-001)'}
          placeholder="STAFF-001"
          autoComplete="off"
          required 
        />
        
        <TextField 
          type={showPassword ? 'text' : 'password'}
          label="Password" 
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="current-password"
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
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Multi-factor authentication is required for staff access
            </Alert>
            {hasEmail === false && !otpSent && (
              <Stack direction="row" spacing={1} mb={2}>
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
            {(hasEmail === true || otpSent) && (
              <TextField 
                label="OTP Code" 
                {...register('otp')}
                error={!!errors.otp}
                helperText={errors.otp?.message || 'Enter the 6-digit code sent to your email'}
                placeholder="123456"
                inputProps={{ 
                  maxLength: 6,
                  pattern: '[0-9]{6}',
                  autoComplete: 'one-time-code',
                  inputMode: 'numeric'
                }}
                required 
              />
            )}
          </Box>
        )}
        
        {import.meta.env.DEV && (
          <Box>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleDemoCredentials}
              type="button"
              startIcon={<BadgeIcon />}
            >
              Use demo staff credentials
            </Button>
          </Box>
        )}
        
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          disabled={!canAttempt || loading || !isValid || (mfaRequired && hasEmail === false && !otpSent)}
          startIcon={<SecurityIcon />}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Signing in...' : mfaRequired ? 'Verify OTP & Access Portal' : 'Continue'}
        </Button>
        
        <Divider />
        
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Customer access? <Button 
              variant="text" 
              onClick={() => navigate('/login')}
              size="small"
            >
              Customer Login
            </Button>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Admin? <Button 
              variant="text" 
              onClick={() => navigate('/admin-login')}
              size="small"
            >
              Admin Login
            </Button>
          </Typography>
        </Box>
      </Stack>
      
      <Box mt={4} p={2} bgcolor="background.paper" borderRadius={1}>
        <Alert severity="info" variant="outlined">
          <Typography variant="caption">
            <strong>Security Notice:</strong> All staff login attempts are monitored and logged. 
            Use only authorized credentials and report any suspicious activity immediately.
          </Typography>
        </Alert>
      </Box>
    </AuthLayout>
  )
}
