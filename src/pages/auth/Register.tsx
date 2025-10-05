import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import api from '../../lib/apiClient'
import { z } from 'zod'
import { allowList, validateAllowList } from '../../lib/validation'
import AuthLayout from '../../app/AuthLayout'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store'
import { loginSuccess } from '../../store/authSlice'
import Box from '@mui/material/Box'

// Task 2 Compliant: Comprehensive Zod schema for registration
const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[A-Za-z ,.'-]+$/, 'Full name contains invalid characters'),
  saId: z.string()
    .length(13, 'SA ID must be exactly 13 digits')
    .regex(/^\d{13}$/, 'SA ID must contain only digits'),
  accountNumber: z.string()
    .min(6, 'Account number must be at least 6 digits')
    .max(18, 'Account number must not exceed 18 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Task 2 Compliant: react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  })

  const password = watch('password', '')

  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 12) score += 25
    if (/[a-z]/.test(password)) score += 15
    if (/[A-Z]/.test(password)) score += 20
    if (/[0-9]/.test(password)) score += 20
    if (/[^A-Za-z0-9]/.test(password)) score += 20
    return Math.min(score, 100)
  }, [password])

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    setSuccess(null)
    
    // Additional allowlist validation
    if (!validateAllowList(data.fullName, allowList.fullName)) {
      return setError('Please enter a valid full name.')
    }
    if (!validateAllowList(data.saId, allowList.saId)) {
      return setError('Invalid South African ID.')
    }
    if (!validateAllowList(data.accountNumber, allowList.accountNumber)) {
      return setError('Invalid account number.')
    }
    if (data.email && !validateAllowList(data.email, allowList.email)) {
      return setError('Invalid email address.')
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        fullName: data.fullName,
        saId: data.saId,
        accountNumber: data.accountNumber,
        email: data.email || undefined,
        password: data.password,
      })
      
      setSuccess('Registration successful. Redirecting...')
      
      // Consider the user authenticated post-registration and mark as first login
      dispatch(loginSuccess({ 
        user: res.data?.data?.user,
        isFirstLogin: true 
      }))
      
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoData = () => {
    setValue('fullName', 'Test Customer', { shouldValidate: true })
    setValue('saId', '1234567890123', { shouldValidate: true })
    setValue('accountNumber', '12345678', { shouldValidate: true })
    setValue('email', 'test@nexuspay.dev', { shouldValidate: true })
    setValue('password', 'TestPass123!', { shouldValidate: true })
    setValue('confirmPassword', 'TestPass123!', { shouldValidate: true })
  }

  return (
    <AuthLayout title="Create your account">
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
        <TextField 
          label="Full Name" 
          {...register('fullName')}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          required 
        />
        <TextField 
          label="SA ID" 
          {...register('saId')}
          error={!!errors.saId}
          helperText={errors.saId?.message}
          inputProps={{ inputMode: 'numeric', pattern: '\\d*' }} 
          required 
        />
        <TextField 
          label="Account Number" 
          {...register('accountNumber')}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber?.message}
          inputProps={{ inputMode: 'numeric', pattern: '\\d*' }} 
          required 
        />
        <TextField 
          label="Email (optional)" 
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
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
        <LinearProgress 
          variant="determinate" 
          value={strength} 
          sx={{ 
            height: 8, 
            borderRadius: 1,
            '& .MuiLinearProgress-bar': {
              backgroundColor: strength < 50 ? 'error.main' : strength < 75 ? 'warning.main' : 'success.main'
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary">
          Password strength: {strength < 50 ? 'Weak' : strength < 75 ? 'Medium' : 'Strong'}
        </Typography>
        <TextField 
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password" 
          {...register('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {import.meta.env.DEV && (
          <Box>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleDemoData}
              type="button"
            >
              Fill with demo data
            </Button>
          </Box>
        )}
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading || !isValid}
        >
          Create account
        </Button>
      </Stack>
    </AuthLayout>
  )
}


