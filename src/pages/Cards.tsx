import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

export default function Cards() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Your Cards</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Virtual Visa •••• 1234</Typography>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography>Physical Mastercard •••• 9876</Typography>
      </Paper>
    </Stack>
  )
}


