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
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useNotifications } from '../../components/NotificationsProvider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/apiClient'
import { useAppSelector } from '../../store'

function maskPII(v: string) { return v.replace(/\d(?=\d{4})/g, '*') }

interface StaffPayment {
  id: string
  amount: number
  currency: string
  reference?: string
  purpose?: string
  beneficiaryName?: string
  beneficiaryBank?: string
  swiftCode?: string
  accountNumber: string
  bankAddress?: string
  bankCity?: string
  bankPostalCode?: string
  bankCountry?: string
  status: string
  createdAt: string
  updatedAt: string
  customerName?: string
  customerEmail?: string
}

export default function StaffPortal() {
  const { user } = useAppSelector((s) => s.auth)
  const isStaff = user?.role === 'staff' || user?.role === 'admin'

  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [action, setAction] = useState<'verify' | 'submit' | null>(null)
  const { notify } = useNotifications()
  const queryClient = useQueryClient()

  const { data: staffQueue, isLoading: isQueueLoading, error: queueError, refetch: refetchQueue } = useQuery({
    queryKey: ['staff-queue-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/v1/payments/staff/queue', { params: { page: 1, limit: 50 } })
      return res.data as { payments: StaffPayment[] }
    },
    enabled: isStaff,
    refetchOnWindowFocus: false,
  })

  const { data: verifiedQueue, isLoading: isVerifiedLoading, error: verifiedError, refetch: refetchVerified } = useQuery({
    queryKey: ['staff-verified-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/v1/payments/staff/verified', { params: { page: 1, limit: 50 } })
      return res.data as { payments: StaffPayment[] }
    },
    enabled: isStaff,
    refetchOnWindowFocus: false,
  })

  const verifyMutation = useMutation({
    mutationFn: async (payload: { id: string; action: 'approve' | 'reject' }) => {
      await api.post(`/api/v1/payments/${payload.id}/verify`, { action: payload.action })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-queue'] }),
  })

  const submitSwiftMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/v1/payments/${id}/submit-swift`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-queue'] }),
  })

  const handle = (id: string, a: 'verify' | 'submit') => { setSelectedId(id); setAction(a); setOpen(true) }

  const confirm = async () => {
    try {
      if (!selectedId || !action) return
      if (action === 'verify') {
        await verifyMutation.mutateAsync({ id: selectedId, action: 'approve' })
        notify({ severity: 'success', message: 'Payment verified' })
      } else {
        await submitSwiftMutation.mutateAsync(selectedId)
        notify({ severity: 'success', message: 'Submitted to SWIFT' })
      }
    } catch (e: any) {
      notify({ severity: 'error', message: e?.response?.data?.message || 'Action failed. Please try again.' })
    } finally {
      setOpen(false)
      setSelectedId('')
      setAction(null)
    }
  }

  if (!isStaff) {
    return (
      <Alert severity="warning">Unauthorized. Staff access only.</Alert>
    )
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Staff Portal</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>Pending Payments Queue</Typography>
        {isQueueLoading && <LinearProgress />}
        {queueError && <Alert severity="error">Failed to load queue.</Alert>}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ref</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>SWIFT</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(staffQueue?.payments ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">No pending payments.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (staffQueue?.payments ?? []).map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.reference || p.id}</TableCell>
                    <TableCell>
                      <Tooltip title={p.customerEmail || ''}>
                        <span>{p.customerName || '—'}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{p.beneficiaryName || '—'}</TableCell>
                    <TableCell>{p.accountNumber || '—'}</TableCell>
                    <TableCell>{p.swiftCode || '—'}</TableCell>
                    <TableCell>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: p.currency }).format(p.amount)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => handle(p.id, 'verify')}>Verify</Button>
                        <Button size="small" variant="contained" onClick={() => handle(p.id, 'submit')}>Submit to SWIFT</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>Verified Payments (ready for SWIFT)</Typography>
        {isVerifiedLoading && <LinearProgress />}
        {verifiedError && <Alert severity="error">Failed to load verified list.</Alert>}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ref</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>SWIFT</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(verifiedQueue?.payments ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No verified payments.</TableCell>
                </TableRow>
              ) : (
                (verifiedQueue?.payments ?? []).map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.reference || p.id}</TableCell>
                    <TableCell>{p.beneficiaryName || '—'}</TableCell>
                    <TableCell>{p.swiftCode || '—'}</TableCell>
                    <TableCell>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: p.currency }).format(p.amount)}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => handle(p.id, 'submit')}>Submit to SWIFT</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{action === 'verify' ? 'Verify Payment' : 'Submit to SWIFT'}</DialogTitle>
        <DialogContent>
          <Typography>Confirm action for selected payment.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={confirm} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}


