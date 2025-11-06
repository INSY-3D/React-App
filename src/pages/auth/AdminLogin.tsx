import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Stack, TextField, Button, Typography, Alert, Box, InputAdornment, IconButton } from '@mui/material'
import { AdminPanelSettings as AdminIcon, Visibility, VisibilityOff } from '@mui/icons-material'
import AuthLayout from '../../app/AuthLayout'
import api from '../../lib/apiClient'
import { useNotifications } from '../../components/NotificationsProvider'
import { useAppDispatch } from '../../store'
import { loginFailed, loginSuccess } from '../../store/authSlice'

const adminLoginSchema = z.object({
  usernameOrEmail: z.string().min(1).regex(/^[a-zA-Z0-9@._-]+$/),
  adminId: z.string().min(3).max(20).regex(/^[A-Z0-9-]+$/),
  password: z.string().min(12).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export default function AdminLogin() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { notify } = useNotifications()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isValid }, setValue } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    mode: 'onChange',
  })

  const handleDemo = () => {
    setValue('usernameOrEmail', 'admin@nexuspay.dev', { shouldDirty: true, shouldValidate: true })
    setValue('adminId', '11223344', { shouldDirty: true, shouldValidate: true })
    setValue('password', 'AdminPass123!', { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (data: AdminLoginFormData) => {
    setLoading(true)
    setError(null)
    try {
      const payload = { usernameOrEmail: data.usernameOrEmail, accountNumber: data.adminId, password: data.password }
      const res = await api.post('/auth/staff-login', payload)
      const user = res?.data?.data?.user ?? res?.data?.user
      if (user?.role !== 'admin') {
        throw new Error('Admin access required')
      }
      const accessToken: string | undefined = res.data?.data?.accessToken ?? res.data?.accessToken
      if (accessToken) {
        const { setAuthToken } = await import('../../lib/apiClient')
        ;(window as any).__nexuspay_isAuthed = true
        setAuthToken(accessToken)
      }
      dispatch(loginSuccess({ user, isFirstLogin: false }))
      notify({ severity: 'success', message: 'Welcome, Admin' })
      navigate('/admin', { replace: true })
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Admin login failed')
      dispatch(loginFailed())
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Admin Portal">
      <Box textAlign="center" mb={3}>
        <AdminIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>Admin Access</Typography>
        <Typography variant="subtitle1" color="text.secondary">Manage staff accounts and access</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Username or Email" {...register('usernameOrEmail')} error={!!errors.usernameOrEmail} helperText={errors.usernameOrEmail?.message} required />
        <TextField label="Admin ID" {...register('adminId')} error={!!errors.adminId} helperText={errors.adminId?.message || 'Your admin identifier'} required />
        <TextField type={showPassword ? 'text' : 'password'} label="Password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} required InputProps={{ endAdornment: (
          <InputAdornment position="end">
            <IconButton aria-label="toggle password" onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )}} />

        {import.meta.env.DEV && (
          <Button variant="outlined" size="small" onClick={handleDemo} type="button">Use demo admin credentials</Button>
        )}

        <Button type="submit" variant="contained" size="large" startIcon={<AdminIcon />} disabled={!isValid || loading}>{loading ? 'Signing in...' : 'Continue'}</Button>
      </Stack>
    </AuthLayout>
  )
}


