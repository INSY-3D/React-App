import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Stack,
  Typography,
  Button,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TablePagination,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material'
import {
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import api from '../lib/apiClient'
import { useAppSelector } from '../store'

interface Payment {
  id: string
  amount: number
  currency: string
  reference?: string
  purpose?: string
  beneficiaryName?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface PaymentListResponse {
  payments: Payment[]
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

export default function Payments() {
  const navigate = useNavigate()
  const { user } = useAppSelector((s) => s.auth)
  const userKey = user?.id || user?.email || 'anon'
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payments', userKey, page + 1, rowsPerPage],
    queryFn: async () => {
      const response = await api.get('/payments', {
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      })
      return response.data.data as PaymentListResponse
    }
  })

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={700}>Payments</Typography>
          <Typography color="text.secondary">Send, request, and manage payments.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<SendIcon />}
          onClick={() => navigate('/payments/new')}
        >
          New International Payment
        </Button>
      </Box>
      
      <Paper>
        <Box p={3} borderBottom="1px solid" borderColor="divider" sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Payment History
            </Typography>
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
            <Alert severity="error">
              Failed to load payments. Please try again later.
            </Alert>
          </Box>
        )}

        {data && (
          <>
            <TableContainer>
              <Table sx={{
                '& tbody tr:nth-of-type(odd)': { backgroundColor: 'rgba(148,163,184,0.04)' }
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Beneficiary</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          No payments found. Create your first international payment to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.payments.map((payment) => {
                      const statusInfo = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.draft
                      
                      return (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {payment.id}
                            </Typography>
                            {payment.reference && (
                              <Typography variant="caption" color="text.secondary">
                                Ref: {payment.reference}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(payment.amount, payment.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {payment.beneficiaryName || 'Not specified'}
                            </Typography>
                            {payment.purpose && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {payment.purpose}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(payment.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/payments/${payment.id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {data.payments.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.pagination.total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </>
        )}
      </Paper>
    </Stack>
  )
}


