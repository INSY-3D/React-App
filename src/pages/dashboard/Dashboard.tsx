import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import RefreshIcon from '@mui/icons-material/Refresh'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import BadgeIcon from '@mui/icons-material/Badge'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import SendIcon from '@mui/icons-material/Send'
import { Link as RouterLink } from 'react-router-dom'
import { useMemo } from 'react'
import { useAppSelector } from '../../store'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/apiClient'

// Simple FX rates to USD base for demo (should be replaced with live rates or server-side conversion)
const FX_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.10,
  GBP: 1.28,
  ZAR: 0.055,
  JPY: 0.0065,
  CAD: 0.73,
  AUD: 0.68,
  CHF: 1.12,
}

function convertAmount(amount: number, from: string, to: string): number {
  const f = FX_TO_USD[from] ?? 1
  const t = FX_TO_USD[to] ?? 1
  const inUsd = amount * f
  return inUsd / t
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

interface PaymentRow {
  id: string
  amount: number
  currency: string
  reference?: string
  purpose?: string
  beneficiaryName?: string
  status: string
  createdAt: string
}

interface PaymentListResponse {
  payments: PaymentRow[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const statusConfig = {
  draft: { color: 'default' as const, label: 'Draft' },
  pending_verification: { color: 'warning' as const, label: 'Pending Verification' },
  verified: { color: 'info' as const, label: 'Verified' },
  submitted_to_swift: { color: 'primary' as const, label: 'Submitted to SWIFT' },
  completed: { color: 'success' as const, label: 'Completed' },
  rejected: { color: 'error' as const, label: 'Rejected' },
  failed: { color: 'error' as const, label: 'Failed' }
}

export default function Dashboard() {
  const { user, isFirstLogin } = useAppSelector((state) => state.auth)
  const isStaff = (user?.role === 'staff' || user?.role === 'admin')
  const welcomeMessage = isFirstLogin ? 'Welcome' : `Welcome back${user?.fullName ? `, ${user.fullName}` : ''}`

  // Determine user's preferred currency: from profile (future), or localStorage, else ZAR
  const preferredCurrency = useMemo(() => {
    if ((user as any)?.preferredCurrency) return (user as any).preferredCurrency as string
    try {
      const stored = localStorage.getItem('np_currency')
      return stored || 'ZAR'
    } catch {
      return 'ZAR'
    }
  }, [user])

  // Customer data (recent payments)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-payments'],
    queryFn: async () => {
      const res = await api.get('/api/v1/payments', { params: { page: 1, limit: 10 } })
      return res.data as PaymentListResponse
    },
    enabled: !isStaff,
  })

  const analytics = useMemo(() => {
    const rows = data?.payments ?? []
    const total = rows.length
    const sumAmount = rows.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    const byStatus = rows.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})
    const sumInPreferred = rows.reduce((acc, p) => {
      const from = (p.currency || '').toUpperCase()
      const to = preferredCurrency.toUpperCase()
      const amt = Number(p.amount) || 0
      return acc + convertAmount(amt, from, to)
    }, 0)
    return { total, sumAmount, byStatus, sumInPreferred }
  }, [data, preferredCurrency])

  // Staff data (pending queue)
  const { data: staffQueue, isLoading: isQueueLoading, error: queueError, refetch: refetchQueue } = useQuery({
    queryKey: ['staff-queue-dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/v1/payments/staff/queue', { params: { page: 1, limit: 20 } })
      return res.data as { payments: Array<{ id: string; amount: number; currency: string; beneficiaryName?: string; swiftCode?: string; reference?: string }> }
    },
    enabled: isStaff,
  })

  // Header with CTAs remains across roles
  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={800}>{isStaff ? 'Staff Dashboard' : welcomeMessage}</Typography>
          <Typography variant="body2" color="text.secondary">{isStaff ? 'Review and process pending payments.' : 'Payment overview and recent activity.'}</Typography>
        </Box>
        <Box display="flex" gap={1}>
          {!isStaff && (
            <>
              <Button component={RouterLink} to="/payments" variant="contained" color="primary" startIcon={<PaymentsRoundedIcon />}>Go to Payments</Button>
              <Button component={RouterLink} to="/beneficiaries" variant="contained" color="secondary" startIcon={<GroupsRoundedIcon />}>Manage Beneficiaries</Button>
            </>
          )}
          {isStaff && (
            <>
              <Button component={RouterLink} to="/staff" variant="contained" color="primary" startIcon={<BadgeIcon />}>Open Staff Portal</Button>
            </>
          )}
        </Box>
      </Box>

      {!isStaff ? (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Payments (last 10)</Typography>
                <Typography variant="h5" fontWeight={800}>{analytics.total}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Pending verification</Typography>
                <Typography variant="h5" fontWeight={800}>{analytics.byStatus['pending_verification'] ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Submitted to SWIFT</Typography>
                <Typography variant="h5" fontWeight={800}>{analytics.byStatus['submitted_to_swift'] ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Total amount ({preferredCurrency})</Typography>
                <Typography variant="h5" fontWeight={800}>
                  {formatCurrency(analytics.sumInPreferred, preferredCurrency)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper>
            <Box p={3} borderBottom="1px solid" borderColor="divider">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>Recent payments</Typography>
                <Tooltip title="Refresh">
                  <IconButton onClick={() => refetch()} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {isLoading && <LinearProgress />}
            {error && (
              <Box p={3}>
                <Alert severity="error">Failed to load payments.</Alert>
              </Box>
            )}

            {data && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Beneficiary</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No recent payments</TableCell>
                      </TableRow>
                    ) : (
                      data.payments.map((p) => {
                        const s = statusConfig[p.status as keyof typeof statusConfig] || statusConfig.draft
                        return (
                          <TableRow key={p.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace">{p.id}</Typography>
                              {p.reference && (
                                <Typography variant="caption" color="text.secondary">Ref: {p.reference}</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>{formatCurrency(p.amount, p.currency)}</Typography>
                            </TableCell>
                            <TableCell>{p.beneficiaryName || '—'}</TableCell>
                            <TableCell>
                              <Chip label={s.label} color={s.color} size="small" />
                            </TableCell>
                            <TableCell>{new Date(p.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Pending queue</Typography>
                <Typography variant="h5" fontWeight={800}>{staffQueue?.payments?.length ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Verified today</Typography>
                <Typography variant="h5" fontWeight={800}>—</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Submitted to SWIFT today</Typography>
                <Typography variant="h5" fontWeight={800}>—</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper>
            <Box p={3} borderBottom="1px solid" borderColor="divider">
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>Pending payments (preview)</Typography>
                <Tooltip title="Refresh">
                  <IconButton onClick={() => refetchQueue()} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {isQueueLoading && <LinearProgress />}
            {queueError && (
              <Box p={3}>
                <Alert severity="error">Failed to load queue.</Alert>
              </Box>
            )}

            {staffQueue && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ref</TableCell>
                      <TableCell>Beneficiary</TableCell>
                      <TableCell>SWIFT</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffQueue.payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No pending payments.</TableCell>
                      </TableRow>
                    ) : (
                      staffQueue.payments.slice(0, 10).map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell>{p.reference || p.id}</TableCell>
                          <TableCell>{p.beneficiaryName || '—'}</TableCell>
                          <TableCell>{p.swiftCode || '—'}</TableCell>
                          <TableCell>{formatCurrency(p.amount, 'USD')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box p={2} display="flex" justifyContent="flex-end" gap={1}>
              <Button component={RouterLink} to="/staff" variant="outlined" startIcon={<AssignmentTurnedInIcon />}>Verify</Button>
              <Button component={RouterLink} to="/staff" variant="contained" startIcon={<SendIcon />}>Submit to SWIFT</Button>
            </Box>
          </Paper>
        </>
      )}
    </Stack>
  )
}


