import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  LinearProgress,
  Box,
  Alert,
  Chip
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store'
import { logout } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from './NotificationsProvider'
import { refreshAuth, performLogout } from '../lib/authCheck'

interface SessionExpiryModalProps {
  open: boolean
  onClose: () => void
  expiresAt: number
  onExtend: () => void
}

export default function SessionExpiryModal({ 
  open, 
  onClose, 
  expiresAt, 
  onExtend 
}: SessionExpiryModalProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.auth)
  const { notify } = useNotifications()
  const [timeLeft, setTimeLeft] = useState(0)
  const [extending, setExtending] = useState(false)

  // Calculate time remaining
  useEffect(() => {
    if (!open) return

    const updateTimeLeft = () => {
      const now = Date.now()
      const remaining = Math.max(0, expiresAt - now)
      setTimeLeft(remaining)

      // Auto-logout when time reaches zero
      if (remaining <= 0) {
        handleForceLogout()
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [open, expiresAt])

  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const handleExtendSession = async () => {
    setExtending(true)
    try {
      // Call the refresh auth endpoint (HttpOnly cookies)
      const result = await refreshAuth()
      
      if (result.isAuthenticated) {
        notify({ 
          severity: 'success', 
          message: 'Session extended successfully' 
        })
        
        onExtend()
        onClose()
      } else {
        throw new Error('Session refresh failed')
      }
    } catch (error) {
      notify({ 
        severity: 'error', 
        message: 'Failed to extend session. Please log in again.' 
      })
      handleForceLogout()
    } finally {
      setExtending(false)
    }
  }

  const handleLogout = async () => {
    // Clear HttpOnly cookies on server
    await performLogout()
    
    dispatch(logout())
    onClose()
    navigate('/login')
    notify({ 
      severity: 'info', 
      message: 'You have been logged out' 
    })
  }

  const handleForceLogout = async () => {
    // Clear HttpOnly cookies on server
    await performLogout()
    
    dispatch(logout())
    onClose()
    navigate('/session-timeout')
    notify({ 
      severity: 'warning', 
      message: 'Your session has expired for security reasons' 
    })
  }

  const progressValue = timeLeft > 0 ? (timeLeft / (5 * 60 * 1000)) * 100 : 0 // Assuming 5-minute warning
  const isUrgent = timeLeft <= 60000 // Last minute
  const isExpired = timeLeft <= 0

  return (
    <Dialog
      open={open}
      onClose={isExpired ? undefined : onClose}
      disableEscapeKeyDown={isUrgent}
      PaperProps={{
        sx: {
          minWidth: 400,
          maxWidth: 500
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon color={isUrgent ? 'error' : 'warning'} />
        <Box flexGrow={1}>
          Session Expiry Warning
        </Box>
        <Chip 
          label={formatTime(timeLeft)}
          color={isUrgent ? 'error' : 'warning'}
          variant="outlined"
          icon={<ScheduleIcon />}
        />
      </DialogTitle>

      <DialogContent>
        <Alert 
          severity={isExpired ? 'error' : isUrgent ? 'error' : 'warning'} 
          sx={{ mb: 2 }}
        >
          {isExpired ? (
            'Your session has expired.'
          ) : isUrgent ? (
            'Your session will expire in less than a minute!'
          ) : (
            'Your session is about to expire for security reasons.'
          )}
        </Alert>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Time remaining: <strong>{formatTime(timeLeft)}</strong>
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color={isUrgent ? 'error' : 'warning'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {user && (
          <Box p={2} bgcolor="background.paper" borderRadius={1} mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Current Session
            </Typography>
            <Typography variant="body2" color="text.secondary">
              User: {user.fullName || user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {user.role}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary">
          {isExpired ? (
            'Please log in again to continue using NexusPay.'
          ) : (
            'You can extend your session or log out now. For security, all unsaved changes will be lost if your session expires.'
          )}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        {isExpired ? (
          <Button
            variant="contained"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            fullWidth
          >
            Return to Login
          </Button>
        ) : (
          <>
            <Button
              onClick={handleLogout}
              variant="outlined"
              startIcon={<LogoutIcon />}
              disabled={extending}
            >
              Logout Now
            </Button>
            <Button
              onClick={handleExtendSession}
              variant="contained"
              disabled={extending || isExpired}
              startIcon={<SecurityIcon />}
            >
              {extending ? 'Extending...' : 'Extend Session'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
