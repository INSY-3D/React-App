import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import BottomSheet from '../components/BottomSheet'

export default function Home() {
  const [open, setOpen] = useState(false)
  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Welcome to NexusPay</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography color="text.secondary">Balance</Typography>
        <Typography variant="h4" fontWeight={800}>R 12,450.00</Typography>
      </Paper>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => setOpen(true)}>Quick Pay</Button>
        <Button variant="outlined">Add Money</Button>
      </Stack>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <Typography variant="h6" fontWeight={700}>Start a payment</Typography>
        <Typography color="text.secondary">Choose a recipient or scan to pay.</Typography>
      </BottomSheet>
    </Stack>
  )
}


