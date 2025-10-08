import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material'
import { useNotifications } from '../../components/NotificationsProvider'
import api from '../../lib/apiClient'
import { jsPDF } from 'jspdf'

interface PaymentDetails {
  id: string
  amount: number
  currency: string
  reference?: string
  purpose?: string
  beneficiaryName?: string
  beneficiaryBank?: string
  swiftCode?: string
  accountNumber: string // Masked for customers
  iban?: string
  status: string
  createdAt: string
  updatedAt: string
  staffVerifiedAt?: string
  submittedToSwiftAt?: string
  completedAt?: string
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

export default function PaymentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useNotifications()

  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const response = await api.get(`/payments/${id}`)
      return response.data.data as PaymentDetails
    },
    enabled: !!id
  })

  const handleCopyReference = (text: string) => {
    navigator.clipboard.writeText(text)
    notify({ severity: 'success', message: 'Reference copied to clipboard' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleDownloadReceipt = () => {
    if (!payment) return

    const doc = new jsPDF()
    const statusInfo = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.draft
    
    // Colors
    const primaryColor = '#1976d2'
    const secondaryColor = '#757575'
    const lightGray = '#f5f5f5'
    
    // Header - NexusPay Logo and Title
    doc.setFillColor(primaryColor)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('NexusPay', 20, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('International Payment Receipt', 20, 30)
    
    // Transaction ID and Status
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Transaction ID: ${payment.id}`, 20, 50)
    
    // Status Badge
    doc.setFillColor(lightGray)
    doc.roundedRect(20, 55, 50, 8, 2, 2, 'F')
    doc.text(`Status: ${statusInfo.label}`, 23, 60)
    
    // Date
    doc.text(`Date: ${formatDate(payment.createdAt)}`, 20, 70)
    
    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 75, 190, 75)
    
    // Payment Information Section
    let yPosition = 85
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Information', 20, yPosition)
    
    yPosition += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    // Amount (highlighted)
    doc.setFillColor(240, 248, 255)
    doc.roundedRect(20, yPosition - 5, 170, 15, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(primaryColor)
    doc.text(`Amount: ${formatCurrency(payment.amount, payment.currency)}`, 25, yPosition + 5)
    
    yPosition += 20
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    
    if (payment.reference) {
      doc.setTextColor(secondaryColor)
      doc.text('Reference:', 20, yPosition)
      doc.setTextColor(0, 0, 0)
      doc.text(payment.reference, 60, yPosition)
      yPosition += 8
    }
    
    if (payment.purpose) {
      doc.setTextColor(secondaryColor)
      doc.text('Purpose:', 20, yPosition)
      doc.setTextColor(0, 0, 0)
      const purposeText = doc.splitTextToSize(payment.purpose, 120)
      doc.text(purposeText, 60, yPosition)
      yPosition += (purposeText.length * 7) + 3
    }
    
    // Divider
    yPosition += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPosition, 190, yPosition)
    
    // Beneficiary Information Section
    yPosition += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Beneficiary Information', 20, yPosition)
    
    yPosition += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    if (payment.beneficiaryName) {
      doc.setTextColor(secondaryColor)
      doc.text('Beneficiary Name:', 20, yPosition)
      doc.setTextColor(0, 0, 0)
      doc.text(payment.beneficiaryName, 70, yPosition)
      yPosition += 8
    }
    
    if (payment.beneficiaryBank) {
      doc.setTextColor(secondaryColor)
      doc.text('Bank:', 20, yPosition)
      doc.setTextColor(0, 0, 0)
      doc.text(payment.beneficiaryBank, 70, yPosition)
      yPosition += 8
    }
    
    if (payment.swiftCode) {
      doc.setTextColor(secondaryColor)
      doc.text('SWIFT/BIC Code:', 20, yPosition)
      doc.setTextColor(0, 0, 0)
      doc.setFont('courier', 'normal')
      doc.text(payment.swiftCode, 70, yPosition)
      doc.setFont('helvetica', 'normal')
      yPosition += 8
    }
    
    doc.setTextColor(secondaryColor)
    doc.text('Account Number:', 20, yPosition)
    doc.setTextColor(0, 0, 0)
    doc.setFont('courier', 'normal')
    doc.text(payment.accountNumber, 70, yPosition)
    doc.setFont('helvetica', 'normal')
    yPosition += 8
    
    if (payment.iban) {
      doc.setTextColor(secondaryColor)
      doc.text('IBAN:', 20, yPosition)
      doc.setTextColor(0, 0, 0)
      doc.setFont('courier', 'normal')
      doc.text(payment.iban, 70, yPosition)
      doc.setFont('helvetica', 'normal')
      yPosition += 8
    }
    
    // Payment Timeline (if applicable)
    if (payment.staffVerifiedAt || payment.submittedToSwiftAt || payment.completedAt) {
      yPosition += 5
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPosition, 190, yPosition)
      
      yPosition += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Payment Timeline', 20, yPosition)
      
      yPosition += 10
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      
      doc.setTextColor(secondaryColor)
      doc.text('Created:', 20, yPosition)
      doc.setTextColor(0, 0, 0)
      doc.text(formatDate(payment.createdAt), 70, yPosition)
      yPosition += 8
      
      if (payment.staffVerifiedAt) {
        doc.setTextColor(secondaryColor)
        doc.text('Verified:', 20, yPosition)
        doc.setTextColor(0, 0, 0)
        doc.text(formatDate(payment.staffVerifiedAt), 70, yPosition)
        yPosition += 8
      }
      
      if (payment.submittedToSwiftAt) {
        doc.setTextColor(secondaryColor)
        doc.text('Submitted to SWIFT:', 20, yPosition)
        doc.setTextColor(0, 0, 0)
        doc.text(formatDate(payment.submittedToSwiftAt), 70, yPosition)
        yPosition += 8
      }
      
      if (payment.completedAt) {
        doc.setTextColor(secondaryColor)
        doc.text('Completed:', 20, yPosition)
        doc.setTextColor(0, 0, 0)
        doc.text(formatDate(payment.completedAt), 70, yPosition)
        yPosition += 8
      }
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFillColor(lightGray)
    doc.rect(0, pageHeight - 25, 210, 25, 'F')
    
    doc.setTextColor(secondaryColor)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('This is a computer-generated receipt and does not require a signature.', 105, pageHeight - 15, { align: 'center' })
    doc.text(`Generated on ${new Date().toLocaleString('en-ZA')}`, 105, pageHeight - 10, { align: 'center' })
    doc.text('NexusPay - Secure International Payments', 105, pageHeight - 5, { align: 'center' })
    
    // Save the PDF
    doc.save(`NexusPay-Receipt-${payment.reference || payment.id}.pdf`)
    notify({ severity: 'success', message: 'Receipt downloaded successfully' })
  }

  const getStatusProgress = (status: string) => {
    const steps = ['draft', 'pending_verification', 'verified', 'submitted_to_swift', 'completed']
    const currentIndex = steps.indexOf(status)
    if (status === 'rejected' || status === 'failed') return 0
    return ((currentIndex + 1) / steps.length) * 100
  }

  if (isLoading) {
    return (
      <Box>
        <LinearProgress />
        <Box p={3}>
          <Typography>Loading payment details...</Typography>
        </Box>
      </Box>
    )
  }

  if (error || !payment) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load payment details. The payment may not exist or you may not have access to it.
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/payments')}>
          Back to Payments
        </Button>
      </Box>
    )
  }

  const statusInfo = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.draft

  return (
    <Box p={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/payments')} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1">
            Payment Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transaction ID: {payment.id}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Download receipt">
            <IconButton onClick={handleDownloadReceipt} aria-label="download receipt">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Chip
            icon={<ReceiptIcon />}
            label={statusInfo.label}
            color={statusInfo.color}
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Progress Indicator */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={getStatusProgress(payment.status)}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {formatDate(payment.createdAt)}
              </Typography>
            </Box>
            {payment.staffVerifiedAt && (
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary">
                  Verified
                </Typography>
                <Typography variant="body2">
                  {formatDate(payment.staffVerifiedAt)}
                </Typography>
              </Box>
            )}
            {payment.submittedToSwiftAt && (
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary">
                  Submitted to SWIFT
                </Typography>
                <Typography variant="body2">
                  {formatDate(payment.submittedToSwiftAt)}
                </Typography>
              </Box>
            )}
            {payment.completedAt && (
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
                <Typography variant="body2">
                  {formatDate(payment.completedAt)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Payment Information */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(payment.amount, payment.currency)}
                  </Typography>
                </Box>
                
                {payment.reference && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Reference
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1">
                        {payment.reference}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyReference(payment.reference!)}
                        aria-label="copy reference"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                )}

                {payment.purpose && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Purpose
                    </Typography>
                    <Typography variant="body1">
                      {payment.purpose}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size="small"
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Beneficiary Information */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Beneficiary Information
              </Typography>
              <Stack spacing={2}>
                {payment.beneficiaryName && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Beneficiary Name
                    </Typography>
                    <Typography variant="body1">
                      {payment.beneficiaryName}
                    </Typography>
                  </Box>
                )}

                {payment.beneficiaryBank && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Bank
                    </Typography>
                    <Typography variant="body1">
                      {payment.beneficiaryBank}
                    </Typography>
                  </Box>
                )}

                {payment.swiftCode && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      SWIFT/BIC Code
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1" fontFamily="monospace">
                        {payment.swiftCode}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyReference(payment.swiftCode!)}
                        aria-label="copy swift code"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {payment.accountNumber}
                  </Typography>
                </Box>

                {payment.iban && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      IBAN
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1" fontFamily="monospace">
                        {payment.iban}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyReference(payment.iban!)}
                        aria-label="copy iban"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box mt={3}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate('/payments')}>
            Back to Payments
          </Button>
          {payment.status === 'draft' && (
            <Button
              variant="contained"
              onClick={() => navigate(`/payments/${payment.id}/edit`)}
            >
              Continue Payment
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
