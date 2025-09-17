import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'

export function Error404() {
  const navigate = useNavigate()
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>Page not found</Typography>
        <Typography color="text.secondary">The page you are looking for doesn’t exist.</Typography>
        <Button onClick={() => navigate('/')} variant="contained">Go Home</Button>
      </Stack>
    </Paper>
  )
}

export function Error500() {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>Something went wrong</Typography>
        <Typography color="text.secondary">Please try again later.</Typography>
      </Stack>
    </Paper>
  )
}

export function Error400() {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>Bad request</Typography>
        <Typography color="text.secondary">Please check your input and try again.</Typography>
      </Stack>
    </Paper>
  )
}

export function SessionTimeout() {
  const navigate = useNavigate()
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>Session expired</Typography>
        <Typography color="text.secondary">You have been logged out for security reasons.</Typography>
        <Button onClick={() => navigate('/login')} variant="contained">Log in again</Button>
      </Stack>
    </Paper>
  )
}


