import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const version = (import.meta.env.VITE_APP_VERSION as string) ?? 'dev'

export default function Footer() {
  return (
    <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
      <Typography variant="caption">NexusPay • v{version}</Typography>
    </Box>
  )
}


