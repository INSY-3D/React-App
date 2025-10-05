import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SecurityIcon from '@mui/icons-material/Security'
import { maskAccountNumber, getCurrencySymbol } from '../../../lib/validation'

interface PaymentData {
  paymentDetails: {
    amount: string
    currency: string
    reference: string
    purpose: string
  }
  beneficiaryDetails: {
    fullName: string
    bankName: string
    swiftCode: string
    accountNumber: string
    iban: string
    address: string
    city: string
    postalCode: string
    country: string
  }
}

interface ReviewAndPayProps {
  data: PaymentData
  onValidation: (isValid: boolean) => void
}

export default function ReviewAndPay({ data, onValidation }: ReviewAndPayProps) {
  const [isReviewed, setIsReviewed] = useState(false)

  // Calculate estimated fees (mock calculation)
  const amount = parseFloat(data.paymentDetails.amount || '0')
  const currency = data.paymentDetails.currency
  const currencySymbol = getCurrencySymbol(currency)
  
  // Base fee amounts in USD, then convert to selected currency
  const baseTransferFee = Math.max(15, amount * 0.001) // Min $15 or 0.1%
  const baseExchangeFee = amount * 0.002 // 0.2% for currency conversion
  
  // Simple conversion rates (in real app, use live rates)
  const conversionRates: Record<string, number> = {
    'USD': 1,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110,
    'CAD': 1.25,
    'AUD': 1.35,
    'CHF': 0.92,
    'CNY': 6.45,
    'ZAR': 15.5,
    'SEK': 8.5
  }
  
  const rate = conversionRates[currency] || 1
  const transferFee = baseTransferFee * rate
  const exchangeFee = baseExchangeFee * rate
  const totalFees = transferFee + exchangeFee
  const totalAmount = amount + totalFees

  const handleReviewComplete = () => {
    setIsReviewed(true)
    onValidation(true)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>Review & Confirm Payment</Typography>
      <Typography color="text.secondary">
        Please review all details carefully before submitting your international payment.
      </Typography>

      <Alert severity="info" icon={<SecurityIcon />}>
        Your payment will be processed through the SWIFT network with bank-grade security.
      </Alert>

      {/* Payment Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Payment Summary
        </Typography>
        
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography>Transfer Amount:</Typography>
            <Typography fontWeight={600}>
              {data.paymentDetails.amount} {data.paymentDetails.currency}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" color="text.secondary">
            <Typography variant="body2">Transfer Fee:</Typography>
            <Typography variant="body2">{currencySymbol}{transferFee.toFixed(2)}</Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" color="text.secondary">
            <Typography variant="body2">Exchange Fee:</Typography>
            <Typography variant="body2">{currencySymbol}{exchangeFee.toFixed(2)}</Typography>
          </Box>
          
          <Divider />
          
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>Total Debit:</Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {currencySymbol}{totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Payment Details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Payment Details
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">Reference</Typography>
            <Typography fontWeight={500}>{data.paymentDetails.reference}</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">Purpose</Typography>
            <Typography fontWeight={500}>{data.paymentDetails.purpose}</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Beneficiary Details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Beneficiary Information
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">Beneficiary Name</Typography>
            <Typography fontWeight={500}>{data.beneficiaryDetails.fullName}</Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">Bank Details</Typography>
            <Typography fontWeight={500}>{data.beneficiaryDetails.bankName}</Typography>
            <Typography variant="body2" color="text.secondary">
              SWIFT: {data.beneficiaryDetails.swiftCode} | 
              Account: {maskAccountNumber(data.beneficiaryDetails.accountNumber)}
              {data.beneficiaryDetails.iban && ` | IBAN: ${data.beneficiaryDetails.iban}`}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">Bank Address</Typography>
            <Typography variant="body2">
              {data.beneficiaryDetails.address}<br />
              {data.beneficiaryDetails.city}, {data.beneficiaryDetails.postalCode}<br />
              {data.beneficiaryDetails.country}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Processing Information */}
      <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Processing Information
        </Typography>
        
        <Stack spacing={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label="1-3 Business Days" size="small" color="primary" />
            <Typography variant="body2">Estimated processing time</Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Chip label="SWIFT Network" size="small" color="secondary" />
            <Typography variant="body2">Secure international transfer</Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2">Compliance verified</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Review Confirmation */}
      {!isReviewed && (
        <Alert 
          severity="warning"
          action={
            <Chip
              label="Mark as Reviewed"
              onClick={handleReviewComplete}
              color="warning"
              variant="outlined"
              clickable
            />
          }
        >
          Please review all details above and mark as reviewed to continue.
        </Alert>
      )}

      {isReviewed && (
        <Alert severity="success" icon={<CheckCircleIcon />}>
          Payment details reviewed and ready for submission.
        </Alert>
      )}
    </Stack>
  )
}
