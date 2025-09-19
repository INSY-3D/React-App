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

export default function Profile() {
  const { user, isFirstLogin } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Clear HttpOnly cookies on server
      await performLogout()
    } catch {
      // Continue with logout even if API call fails
    } finally {
      dispatch(logout())
      navigate('/login', { replace: true })
    }
  }

  // Get user initials for avatar
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'NP'

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
          Manage your account settings, notifications, and security preferences.
        </Typography>
        
        {/* Only show logout button if NOT first login */}
        {!isFirstLogin && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        )}
      </Paper>
    </Stack>
  )
}


