import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import api from '../../lib/apiClient'
import { z } from 'zod'
import { allowList, validateAllowList } from '../../lib/validation'
import AuthLayout from '../../app/AuthLayout'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store'
import { loginSuccess } from '../../store/authSlice'
import Box from '@mui/material/Box'

const nameRegex = /^[A-Za-z ,.'-]{2,}$/
const saIdRegex = /^\d{13}$/
const accountRegex = /^\d{6,18}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const strongPassword = z
  .string()
  .min(12)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/)

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [fullName, setFullName] = useState('')
  const [saId, setSaId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 12) score += 25
    if (/[a-z]/.test(password)) score += 15
    if (/[A-Z]/.test(password)) score += 20
    if (/[0-9]/.test(password)) score += 20
    if (/[^A-Za-z0-9]/.test(password)) score += 20
    return Math.min(score, 100)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    // Client-side allow-list validation
    if (!validateAllowList(fullName, allowList.fullName)) return setError('Please enter a valid full name.')
    if (!validateAllowList(saId, allowList.saId)) return setError('Invalid South African ID.')
    if (!validateAllowList(accountNumber, allowList.accountNumber)) return setError('Invalid account number.')
    if (email && !validateAllowList(email, allowList.email)) return setError('Invalid email address.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    try {
      strongPassword.parse(password)
    } catch {
      return setError('Password must be 12+ chars with mixed character types.')
    }

    setLoading(true)
    try {
      const res = await api.post('/api/v1/register', {
        fullName,
        saId,
        accountNumber,
        email: email || undefined,
        password,
      })
      setSuccess('Registration successful. Redirecting...')
      // Consider the user authenticated post-registration and mark as first login
      dispatch(loginSuccess({ 
        user: res.data?.user,
        isFirstLogin: true 
      }))
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account">
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <TextField label="SA ID" value={saId} onChange={(e) => setSaId(e.target.value)} inputProps={{ inputMode: 'numeric', pattern: '\\d*' }} required />
        <TextField label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} inputProps={{ inputMode: 'numeric', pattern: '\\d*' }} required />
        <TextField label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <LinearProgress variant="determinate" value={strength} sx={{ height: 8, borderRadius: 1 }} />
        <TextField type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        {import.meta.env.DEV && (
          <Box>
            <Button variant="outlined" size="small" onClick={() => {
              setFullName('Dev User')
              setSaId('9001014800086')
              setAccountNumber('1234567890')
              setEmail('test@nexuspay.dev')
              setPassword('DevPassw0rd!2025')
              setConfirmPassword('DevPassw0rd!2025')
            }}>Fill with demo data</Button>
          </Box>
        )}
        <Button type="submit" variant="contained" disabled={loading}>Create account</Button>
      </Stack>
    </AuthLayout>
  )
}


