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
import Chip from '@mui/material/Chip'
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
  customerName?: string
  customerEmail?: string
  staffVerifiedAt?: string
  submittedToSwiftAt?: string
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
      const res = await api.get('/payments/staff/queue', { params: { page: 1, limit: 50 } })
      return res.data.data as { payments: StaffPayment[] }
    },
    enabled: isStaff,
    refetchOnWindowFocus: false,
  })

  const { data: verifiedQueue, isLoading: isVerifiedLoading, error: verifiedError, refetch: refetchVerified } = useQuery({
    queryKey: ['staff-verified-dashboard'],
    queryFn: async () => {
      const res = await api.get('/payments/staff/verified', { params: { page: 1, limit: 50 } })
      return res.data.data as { payments: StaffPayment[] }
    },
    enabled: isStaff,
    refetchOnWindowFocus: false,
  })

  const { data: swiftQueue, isLoading: isSwiftLoading, error: swiftError, refetch: refetchSwift } = useQuery({
    queryKey: ['staff-swift-dashboard'],
    queryFn: async () => {
      const res = await api.get('/payments/staff/swift', { params: { page: 1, limit: 50 } })
      return res.data.data as { payments: StaffPayment[] }
    },
    enabled: isStaff,
    refetchOnWindowFocus: false,
  })

  const verifyMutation = useMutation({
    mutationFn: async (payload: { id: string; action: 'approve' | 'reject' }) => {
      await api.post(`/payments/${payload.id}/verify`, { action: payload.action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-queue-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['staff-verified-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['staff-swift-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-payments'] })
    }
  })

  const submitSwiftMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/payments/${id}/submit-swift`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-verified-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['staff-swift-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-payments'] })
    }
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
        <Typography fontWeight={700} gutterBottom>
          Pending Payments Queue
        </Typography>
        {isQueueLoading && <LinearProgress />}
        {queueError && <Alert severity="error">Failed to load pending payments.</Alert>}
        {staffQueue && (
          <TableContainer>
            <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { backgroundColor: 'rgba(148,163,184,0.04)' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Beneficiary</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>SWIFT/BIC</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!staffQueue?.payments || staffQueue.payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No payments pending verification.</TableCell>
                  </TableRow>
                ) : staffQueue.payments.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.customerName || p.customerEmail || 'N/A'}</TableCell>
                    <TableCell>{p.amount} {p.currency}</TableCell>
                    <TableCell>{p.beneficiaryName || 'N/A'}</TableCell>
                    <TableCell>{p.accountNumber}</TableCell>
                    <TableCell>{p.swiftCode || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="contained" onClick={() => handle(p.id, 'verify')}>Verify</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>
          Verified Payments Ready for SWIFT
        </Typography>
        {isVerifiedLoading && <LinearProgress />}
        {verifiedError && <Alert severity="error">Failed to load verified payments.</Alert>}
        {verifiedQueue && (
          <TableContainer>
            <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { backgroundColor: 'rgba(148,163,184,0.04)' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Beneficiary</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>SWIFT/BIC</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!verifiedQueue?.payments || verifiedQueue.payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No verified payments awaiting SWIFT submission.</TableCell>
                  </TableRow>
                ) : verifiedQueue.payments.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.customerName || p.customerEmail || 'N/A'}</TableCell>
                    <TableCell>{p.amount} {p.currency}</TableCell>
                    <TableCell>{p.beneficiaryName || 'N/A'}</TableCell>
                    <TableCell>{p.accountNumber}</TableCell>
                    <TableCell>{p.swiftCode || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="contained" onClick={() => handle(p.id, 'submit')}>Submit to SWIFT</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Completed/SWIFT Submitted Payments Section */}
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={700} gutterBottom>
          Completed Payments (Submitted to SWIFT)
        </Typography>
        {isSwiftLoading && <LinearProgress />}
        {swiftError && <Alert severity="error">Failed to load completed payments.</Alert>}
        {swiftQueue && (
          <TableContainer>
            <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { backgroundColor: 'rgba(148,163,184,0.04)' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Beneficiary</TableCell>
                  <TableCell>SWIFT/BIC</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!swiftQueue?.payments || swiftQueue.payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No completed payments.</TableCell>
                  </TableRow>
                ) : swiftQueue.payments.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.customerName || p.customerEmail || 'N/A'}</TableCell>
                    <TableCell>{p.amount} {p.currency}</TableCell>
                    <TableCell>{p.beneficiaryName || 'N/A'}</TableCell>
                    <TableCell>{p.swiftCode || 'N/A'}</TableCell>
                    <TableCell>
                      {p.submittedToSwiftAt ? new Date(p.submittedToSwiftAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Submitted to SWIFT"
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{action === 'verify' ? 'Verify Payment' : 'Submit to SWIFT'}</DialogTitle>
        <DialogContent>
          Confirm you want to {action === 'verify' ? 'verify' : 'submit'} payment {selectedId}.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={confirm} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}


