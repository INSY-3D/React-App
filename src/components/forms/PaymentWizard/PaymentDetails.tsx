import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import { 
  validateAmount, 
  validateAllowList, 
  allowList, 
  supportedCurrencies, 
  validateCurrency 
} from '../../../lib/validation'

interface PaymentDetailsProps {
  data: {
    amount: string
    currency: string
    reference: string
    purpose: string
  }
  onChange: (data: any) => void
  onValidation: (isValid: boolean) => void
}

export default function PaymentDetails({ data, onChange, onValidation }: PaymentDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'amount':
        if (!validateAmount(value)) {
          newErrors.amount = 'Please enter a valid amount (e.g., 100.50)'
        } else {
          delete newErrors.amount
        }
        break
      case 'currency':
        if (!validateCurrency(value)) {
          newErrors.currency = 'Please select a supported currency'
        } else {
          delete newErrors.currency
        }
        break
      case 'reference':
        if (!validateAllowList(value, allowList.reference)) {
          newErrors.reference = 'Reference must be 1-35 characters (letters, numbers, spaces, hyphens, dots only)'
        } else {
          delete newErrors.reference
        }
        break
      case 'purpose':
        if (!value.trim()) {
          newErrors.purpose = 'Purpose of payment is required'
        } else if (value.length > 140) {
          newErrors.purpose = 'Purpose must be less than 140 characters'
        } else {
          delete newErrors.purpose
        }
        break
    }
    
    setErrors(newErrors)
    
    // Check overall validity
    const isFormValid = Object.keys(newErrors).length === 0 && 
                       !!data.amount && !!data.currency && !!data.reference && !!data.purpose
    onValidation(isFormValid)
  }

  const handleChange = (field: string, value: string) => {
    const newData = { ...data, [field]: value }
    onChange(newData)
    validateField(field, value)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>Payment Details</Typography>
      <Typography color="text.secondary">
        Enter the payment amount and details for your international transfer.
      </Typography>

      <Alert severity="info">
        All international payments are processed through SWIFT network with full compliance monitoring.
      </Alert>

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Amount"
            value={data.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]+(\\.[0-9]{1,2})?'
            }}
            required
            fullWidth
          />
          
          <TextField
            select
            label="Currency"
            value={data.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            error={!!errors.currency}
            helperText={errors.currency || 'Select payment currency'}
            required
            sx={{ minWidth: 120 }}
          >
            {supportedCurrencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <TextField
          label="Payment Reference"
          value={data.reference}
          onChange={(e) => handleChange('reference', e.target.value)}
          error={!!errors.reference}
          helperText={errors.reference || 'Unique reference for this payment (1-35 characters)'}
          required
          fullWidth
        />

        <TextField
          label="Purpose of Payment"
          value={data.purpose}
          onChange={(e) => handleChange('purpose', e.target.value)}
          error={!!errors.purpose}
          helperText={errors.purpose || `${data.purpose.length}/140 characters`}
          multiline
          rows={3}
          required
          fullWidth
        />
      </Stack>
    </Stack>
  )
}
