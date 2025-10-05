import { useEffect, useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
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
import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/apiClient'

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

interface SavedBeneficiary {
  id: string
  fullName: string
  bankName: string
  accountNumberMasked: string
  swiftCode: string
}

type Mode = 'saved' | 'new' | 'oneTime'

export default function BeneficiaryDetails({ data, onChange, onValidation }: BeneficiaryDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mode, setMode] = useState<Mode>('saved')
  const [selectedId, setSelectedId] = useState<string>('')

  const { data: savedList = [] } = useQuery<SavedBeneficiary[]>({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const res = await api.get('/beneficiaries')
      return (res.data.data as Array<{ id: string; fullName: string; bankName: string; accountNumberMasked: string; swiftCode: string }>).
        map(b => ({ id: b.id, fullName: b.fullName, bankName: b.bankName, accountNumber: b.accountNumberMasked, swiftCode: b.swiftCode }))
    }
  })

  const inputsReadOnly = mode === 'saved' && !!selectedId
  const readOnlyIdentity = inputsReadOnly

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    switch (field) {
      case 'fullName':
        if (!validateAllowList(value, allowList.fullName)) newErrors.fullName = 'Please enter a valid full name (2+ characters, letters only)'; else delete newErrors.fullName
        break
      case 'bankName':
        if (!value.trim() || value.length < 2) newErrors.bankName = 'Bank name is required (minimum 2 characters)'; else delete newErrors.bankName
        break
      case 'swiftCode':
        if (!validateSWIFTCode(value)) newErrors.swiftCode = 'Invalid SWIFT/BIC code (8 or 11 characters)'; else delete newErrors.swiftCode
        break
      case 'accountNumber':
        // If using saved beneficiary, allow masked account numbers
        if (mode === 'saved' && selectedId && value.includes('*')) {
          delete newErrors.accountNumber
        } else if (!validateAllowList(value, allowList.accountNumber)) {
          newErrors.accountNumber = 'Invalid account number (6-18 digits)'
        } else {
          delete newErrors.accountNumber
        }
        break
      case 'iban':
        if (value && !validateIBAN(value)) newErrors.iban = 'Invalid IBAN format or checksum'; else delete newErrors.iban
        break
      case 'address':
        if (!validateAllowList(value, allowList.address)) newErrors.address = 'Invalid address format (1-70 characters)'; else delete newErrors.address
        break
      case 'city':
        if (!validateAllowList(value, allowList.city)) newErrors.city = 'Invalid city name (1-35 characters, letters only)'; else delete newErrors.city
        break
      case 'postalCode':
        if (!validateAllowList(value, allowList.postalCode)) newErrors.postalCode = 'Invalid postal code (1-16 characters)'; else delete newErrors.postalCode
        break
      case 'country':
        if (!validateCountryCode(value)) newErrors.country = 'Please select a supported country'; else delete newErrors.country
        break
    }
    setErrors(newErrors)
    validateForm(data, newErrors)
  }

  const validateForm = (formData: any, currentErrors: Record<string, string> = errors) => {
    const requiredFields = ['fullName', 'bankName', 'swiftCode', 'accountNumber', 'address', 'city', 'postalCode', 'country']
    // For saved beneficiaries, accountNumber might be masked, so don't require it to be filled
    const fieldsToCheck = (mode === 'saved' && selectedId && formData.accountNumber.includes('*')) 
      ? requiredFields.filter(f => f !== 'accountNumber')
      : requiredFields
    const hasAllRequired = fieldsToCheck.every(field => (formData[field as keyof typeof formData] || '').toString().trim())

    // If using saved beneficiary and selected, require address fields to proceed
    const addressFields = ['address','city','postalCode','country']
    const hasAllAddress = addressFields.every(field => (formData[field as keyof typeof formData] || '').toString().trim())
    const isValid = (mode === 'saved' && !!selectedId) ? hasAllAddress && Object.keys(currentErrors).length === 0 : (Object.keys(currentErrors).length === 0 && hasAllRequired)
    onValidation(isValid)
  }

  const validateAllFields = (formData: any) => {
    const newErrors: Record<string, string> = {}
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const value = formData[field] || ''
      switch (field) {
        case 'fullName':
          if (!validateAllowList(value, allowList.fullName)) newErrors.fullName = 'Please enter a valid full name (2+ characters, letters only)'
          break
        case 'bankName':
          if (!value.trim() || value.length < 2) newErrors.bankName = 'Bank name is required (minimum 2 characters)'
          break
        case 'swiftCode':
          if (!validateSWIFTCode(value)) newErrors.swiftCode = 'Invalid SWIFT/BIC code (8 or 11 characters)'
          break
        case 'accountNumber':
          if (mode === 'saved' && selectedId && value.includes('*')) {
            // Allow masked account numbers for saved beneficiaries
          } else if (!validateAllowList(value, allowList.accountNumber)) {
            newErrors.accountNumber = 'Invalid account number (6-18 digits)'
          }
          break
        case 'iban':
          if (value && !validateIBAN(value)) newErrors.iban = 'Invalid IBAN format or checksum'
          break
        case 'address':
          if (!validateAllowList(value, allowList.address)) newErrors.address = 'Invalid address format (1-70 characters)'
          break
        case 'city':
          if (!validateAllowList(value, allowList.city)) newErrors.city = 'Invalid city name (1-35 characters, letters only)'
          break
        case 'postalCode':
          if (!validateAllowList(value, allowList.postalCode)) newErrors.postalCode = 'Invalid postal code (1-16 characters)'
          break
        case 'country':
          if (!validateCountryCode(value)) newErrors.country = 'Please select a supported country'
          break
      }
    })
    
    setErrors(newErrors)
    validateForm(formData, newErrors)
  }

  const handleChange = (field: string, value: string) => {
    let processedValue = value
    if (field === 'swiftCode') processedValue = formatSWIFT(value)
    else if (field === 'iban') processedValue = formatIBAN(value)

    const newData = { ...data, [field]: processedValue }
    onChange(newData)
    validateField(field, processedValue)
  }

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    if (newMode !== 'saved') {
      setSelectedId('')
      onValidation(false)
    } else {
      onValidation(!!selectedId)
    }
  }

  const handleSelectSaved = (id: string) => {
    setSelectedId(id)
    const selected = savedList.find(b => b.id === id)
    if (selected) {
      const newData = {
        ...data,
        fullName: selected.fullName,
        bankName: selected.bankName,
        swiftCode: selected.swiftCode,
        // Use masked account number for display, but user needs to enter real one
        accountNumber: selected.accountNumber, // This is the masked version
        // Clear IBAN since it's not stored in saved beneficiaries
        iban: '',
      }
      onChange(newData)
      // Trigger validation after a short delay to allow state to update
      setTimeout(() => {
        validateAllFields(newData)
      }, 100)
      setErrors({})
    } else {
      onValidation(false)
    }
  }

  const showSavedSelector = useMemo(() => mode === 'saved', [mode])

  useEffect(() => {
    // Re-validate on data changes for non-saved modes
    if (!(mode === 'saved' && selectedId)) {
      ;['fullName','bankName','swiftCode','accountNumber','iban','address','city','postalCode','country'].forEach(k => validateField(k, (data as any)[k] || ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>Beneficiary Details</Typography>
      <Typography color="text.secondary">
        Enter the recipient's bank and personal information for the international transfer.
      </Typography>

      <RadioGroup row value={mode} onChange={(e) => handleModeChange(e.target.value as Mode)}>
        <FormControlLabel value="saved" control={<Radio />} label="Use saved beneficiary" />
        <FormControlLabel value="new" control={<Radio />} label="Add new beneficiary" />
        <FormControlLabel value="oneTime" control={<Radio />} label="One-time beneficiary" />
      </RadioGroup>

      {showSavedSelector && (
        <>
          <TextField
            select
            label="Saved beneficiaries"
            value={selectedId}
            onChange={(e) => handleSelectSaved(e.target.value)}
            helperText={savedList.length ? 'Select a saved beneficiary to auto-fill details' : 'You have no saved beneficiaries yet'}
            fullWidth
          >
            {savedList.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.fullName} • {b.bankName} • {b.swiftCode}</MenuItem>
            ))}
          </TextField>
          {selectedId && (
            <Alert severity="info">Using saved beneficiary. You can review details below; some fields are read-only.</Alert>
          )}
        </>
      )}

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
          InputProps={{ readOnly: readOnlyIdentity }}
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
          InputProps={{ readOnly: readOnlyIdentity }}
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
            InputProps={{ readOnly: readOnlyIdentity }}
          />
          <TextField
            label="Account Number"
            value={data.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            error={!!errors.accountNumber}
            helperText={errors.accountNumber || (inputsReadOnly ? 'Enter the beneficiary account number' : (mode === 'saved' && data.accountNumber.includes('*') ? 'Please enter the full account number (masked for security)' : ''))}
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
            <MenuItem key={country.code} value={country.code}>
              {country.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  )
}
