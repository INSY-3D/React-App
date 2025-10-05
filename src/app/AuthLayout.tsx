import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { type PropsWithChildren } from 'react'

export default function AuthLayout({ title = 'NexusPay', children }: PropsWithChildren<{ title?: string }>) {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      px: 2,
    }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom align="center">{title}</Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  )
}


