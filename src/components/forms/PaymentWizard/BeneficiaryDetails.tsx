import { useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { 
  validateSWIFTCode, 
  validateIBAN, 
  validateAllowList, 
  allowList,
  formatSWIFT,
  formatIBAN,
  swiftCountries,
  validateCountryCode
} from '../../../lib/validation'

interface BeneficiaryDetailsProps {
  data: {
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
  onChange: (data: any) => void
  onValidation: (isValid: boolean) => void
}

export default function BeneficiaryDetails({ data, onChange, onValidation }: BeneficiaryDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'fullName':
        if (!validateAllowList(value, allowList.fullName)) {
          newErrors.fullName = 'Please enter a valid full name (2+ characters, letters only)'
        } else {
          delete newErrors.fullName
        }
        break
      case 'bankName':
        if (!value.trim() || value.length < 2) {
          newErrors.bankName = 'Bank name is required (minimum 2 characters)'
        } else {
          delete newErrors.bankName
        }
        break
      case 'swiftCode':
        if (!validateSWIFTCode(value)) {
          newErrors.swiftCode = 'Invalid SWIFT/BIC code (8 or 11 characters, e.g., ABCDUS33)'
        } else {
          delete newErrors.swiftCode
        }
        break
      case 'accountNumber':
        if (!validateAllowList(value, allowList.accountNumber)) {
          newErrors.accountNumber = 'Invalid account number (6-18 digits)'
        } else {
          delete newErrors.accountNumber
        }
        break
      case 'iban':
        if (value && !validateIBAN(value)) {
          newErrors.iban = 'Invalid IBAN format or checksum'
        } else {
          delete newErrors.iban
        }
        break
      case 'address':
        if (!validateAllowList(value, allowList.address)) {
          newErrors.address = 'Invalid address format (1-70 characters)'
        } else {
          delete newErrors.address
        }
        break
      case 'city':
        if (!validateAllowList(value, allowList.city)) {
          newErrors.city = 'Invalid city name (1-35 characters, letters only)'
        } else {
          delete newErrors.city
        }
        break
      case 'postalCode':
        if (!validateAllowList(value, allowList.postalCode)) {
          newErrors.postalCode = 'Invalid postal code (1-16 characters)'
        } else {
          delete newErrors.postalCode
        }
        break
      case 'country':
        if (!validateCountryCode(value)) {
          newErrors.country = 'Please select a supported country'
        } else {
          delete newErrors.country
        }
        break
    }
    
    setErrors(newErrors)
    
    // Check overall validity
    const requiredFields = ['fullName', 'bankName', 'swiftCode', 'accountNumber', 'address', 'city', 'postalCode', 'country']
    const hasAllRequired = requiredFields.every(field => data[field as keyof typeof data]?.trim())
    const isValid = Object.keys(newErrors).length === 0 && hasAllRequired
    onValidation(isValid)
  }

  const handleChange = (field: string, value: string) => {
    let processedValue = value
    
    // Auto-format certain fields
    if (field === 'swiftCode') {
      processedValue = formatSWIFT(value)
    } else if (field === 'iban') {
      processedValue = formatIBAN(value)
    }
    
    const newData = { ...data, [field]: processedValue }
    onChange(newData)
    validateField(field, processedValue)
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>Beneficiary Details</Typography>
      <Typography color="text.secondary">
        Enter the recipient's bank and personal information for the international transfer.
      </Typography>

      <Alert severity="warning">
        Ensure all details are accurate. Incorrect information may cause delays or additional fees.
      </Alert>

      <Stack spacing={2}>
        <Typography variant="subtitle2" fontWeight={600}>Beneficiary Information</Typography>
        
        <TextField
          label="Beneficiary Full Name"
          value={data.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={!!errors.fullName}
          helperText={errors.fullName || 'Full name as it appears on the bank account'}
          required
          fullWidth
        />

        <Divider />
        
        <Typography variant="subtitle2" fontWeight={600}>Bank Information</Typography>
        
        <TextField
          label="Bank Name"
          value={data.bankName}
          onChange={(e) => handleChange('bankName', e.target.value)}
          error={!!errors.bankName}
          helperText={errors.bankName || 'Full name of the beneficiary bank'}
          required
          fullWidth
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="SWIFT/BIC Code"
            value={data.swiftCode}
            onChange={(e) => handleChange('swiftCode', e.target.value)}
            error={!!errors.swiftCode}
            helperText={errors.swiftCode || 'Bank identifier code (8 or 11 characters)'}
            inputProps={{ style: { textTransform: 'uppercase' } }}
            required
            fullWidth
          />
          
          <TextField
            label="Account Number"
            value={data.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            error={!!errors.accountNumber}
            helperText={errors.accountNumber}
            inputProps={{ inputMode: 'numeric' }}
            required
            fullWidth
          />
        </Stack>

        <TextField
          label="IBAN (if applicable)"
          value={data.iban}
          onChange={(e) => handleChange('iban', e.target.value)}
          error={!!errors.iban}
          helperText={errors.iban || 'International Bank Account Number (optional for non-EU banks)'}
          inputProps={{ style: { textTransform: 'uppercase' } }}
          fullWidth
        />

        <Divider />
        
        <Typography variant="subtitle2" fontWeight={600}>Bank Address</Typography>

        <TextField
          label="Bank Address"
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
          required
          fullWidth
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="City"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={!!errors.city}
            helperText={errors.city}
            required
            fullWidth
          />
          
          <TextField
            label="Postal Code"
            value={data.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            error={!!errors.postalCode}
            helperText={errors.postalCode}
            required
            fullWidth
          />
        </Stack>

        <TextField
          select
          label="Country"
          value={data.country}
          onChange={(e) => handleChange('country', e.target.value)}
          error={!!errors.country}
          helperText={errors.country || 'Select the country where the bank is located'}
          required
          fullWidth
        >
          {swiftCountries.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  )
}
