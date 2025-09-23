import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAppSelector, useAppDispatch } from '../store'
import { logout } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'
import { performLogout } from '../lib/authCheck'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { supportedCurrencies } from '../lib/validation'
import { useEffect, useState } from 'react'

export default function Profile() {
  const { user, isFirstLogin } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await performLogout()
    } catch {
    } finally {
      dispatch(logout())
      navigate('/login', { replace: true })
    }
  }

  // Get user initials for avatar
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'NP'

  // Preferred currency (persisted locally for now)
  const THEME_CCY_KEY = 'np_currency'
  const [currency, setCurrency] = useState<string>('ZAR')
  const [saved, setSaved] = useState<boolean>(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_CCY_KEY)
      if (stored) setCurrency(stored)
    } catch {}
  }, [])

  const saveCurrency = () => {
    try {
      localStorage.setItem(THEME_CCY_KEY, currency)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {}
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.main' }}>{initials}</Avatar>
        <div>
          <Typography variant="h6" fontWeight={700}>
            {user?.fullName || 'NexusPay User'}
          </Typography>
          <Typography color="text.secondary">
            {user?.email || 'user@nexuspay.app'}
          </Typography>
        </div>
      </Stack>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Account Information
        </Typography>
        <Stack spacing={2}>
          <div>
            <Typography variant="body2" color="text.secondary">Full Name</Typography>
            <Typography>{user?.fullName || 'Not provided'}</Typography>
          </div>
          <div>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography>{user?.email || 'Not provided'}</Typography>
          </div>
          <div>
            <Typography variant="body2" color="text.secondary">Role</Typography>
            <Typography sx={{ textTransform: 'capitalize' }}>
              {user?.role || 'Customer'}
            </Typography>
          </div>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Settings and Preferences
        </Typography>
        <Typography color="text.secondary" paragraph>
          Manage your account settings, preferred currency and logout.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField
            select
            label="Preferred Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            helperText="Displayed on dashboard totals"
            sx={{ minWidth: 220 }}
          >
            {supportedCurrencies.map(ccy => (
              <MenuItem key={ccy} value={ccy}>{ccy}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={saveCurrency}>Save</Button>
          {saved && <Typography color="success.main">Saved</Typography>}
        </Stack>

        <Divider sx={{ my: 2 }} />
        {!isFirstLogin && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ mt: 1 }}
          >
            Logout
          </Button>
        )}
      </Paper>
    </Stack>
  )
}


