import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { useState } from 'react'
import { useNotifications } from '../../components/NotificationsProvider'

function maskPII(v: string) { return v.replace(/\d(?=\d{4})/g, '*') }

export default function StaffPortal() {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<'verify' | 'submit' | null>(null)
  const handle = (a: 'verify' | 'submit') => { setAction(a); setOpen(true) }
  const { notify } = useNotifications()

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Staff Portal</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>Pending Payments Queue</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ref</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[{ref:'P-0001',name:'Acme',account:'1234567890'}].map((p) => (
                <TableRow key={p.ref}>
                  <TableCell>{p.ref}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{maskPII(p.account)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => handle('verify')}>Verify</Button>
                      <Button size="small" variant="contained" onClick={() => handle('submit')}>Submit to SWIFT</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>Audit Log</Typography>
        <Typography color="text.secondary">Read-only, paginated log will appear here.</Typography>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{action === 'verify' ? 'Verify Payment' : 'Submit to SWIFT'}</DialogTitle>
        <DialogContent>
          <Typography>Confirm action for selected payment.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { setOpen(false); notify({ severity: 'success', message: action === 'verify' ? 'Payment verified' : 'Submitted to SWIFT' }) }} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}


