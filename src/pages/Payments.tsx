import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import SendIcon from '@mui/icons-material/Send'
import { useNavigate } from 'react-router-dom'

export default function Payments() {
  const navigate = useNavigate()

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>Payments</Typography>
      <Typography color="text.secondary">Send, request, and manage payments.</Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          International Payments
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Send money internationally through the SWIFT network with full compliance monitoring.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            onClick={() => navigate('/payments/new')}
          >
            New International Payment
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Payment History
        </Typography>
        <Typography color="text.secondary">
          Your recent payment transactions will appear here.
        </Typography>
      </Paper>
    </Stack>
  )
}


