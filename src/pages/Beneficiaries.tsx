import { useMemo, useState } from 'react'
import {
  Stack,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material'
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { allowList, validateAllowList, validateSWIFTCode } from '../lib/validation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/apiClient'

interface Beneficiary {
  id: string
  fullName: string
  bankName: string
  accountNumber: string
  swiftCode: string
}

export default function Beneficiaries() {
  const queryClient = useQueryClient()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const res = await api.get('/api/v1/beneficiaries')
      return (res.data as Array<{ id: string; fullName: string; bankName: string; accountNumberMasked: string; swiftCode: string; createdAt: string }>)
        .map(d => ({ id: d.id, fullName: d.fullName, bankName: d.bankName, accountNumber: d.accountNumberMasked, swiftCode: d.swiftCode })) as Beneficiary[]
    }
  })
  const [fullName, setFullName] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: async (payload: { fullName: string; bankName: string; accountNumber: string; swiftCode: string }) => {
      await api.post('/api/v1/beneficiaries', payload)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/beneficiaries/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
  })

  // Normalized inputs for robust validation
  const { cleanedFullName, cleanedBankName, cleanedAccount, cleanedSwift } = useMemo(() => ({
    cleanedFullName: fullName.trim(),
    cleanedBankName: bankName.trim(),
    cleanedAccount: accountNumber.replace(/\s/g, ''),
    cleanedSwift: swiftCode.replace(/\s/g, '').toUpperCase(),
  }), [fullName, bankName, accountNumber, swiftCode])

  const fullNameValid = useMemo(() => validateAllowList(cleanedFullName, allowList.fullName), [cleanedFullName])
  const bankNameValid = useMemo(() => cleanedBankName.length >= 2, [cleanedBankName])
  const accountValid = useMemo(() => validateAllowList(cleanedAccount, allowList.accountNumber), [cleanedAccount])
  const swiftValid = useMemo(() => validateSWIFTCode(cleanedSwift), [cleanedSwift])

  const isValid = fullNameValid && bankNameValid && accountValid && swiftValid

  const addBeneficiary = () => {
    setError(null)
    if (!isValid) {
      setError('Please complete all fields correctly.')
      return
    }
    createMutation.mutate({
      fullName: cleanedFullName,
      bankName: cleanedBankName,
      accountNumber: cleanedAccount,
      swiftCode: cleanedSwift,
    })
    setFullName('')
    setBankName('')
    setAccountNumber('')
    setSwiftCode('')
  }

  const remove = (id: string) => deleteMutation.mutate(id)

  const mask = (n: string) => (n.length > 4 ? `${'*'.repeat(n.length - 4)}${n.slice(-4)}` : n)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700}>Beneficiaries</Typography>
        <Typography color="text.secondary">Add recipients you pay often to speed up future payments.</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700}>Add beneficiary</Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField 
              label="Full name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              error={fullName.length > 0 && !fullNameValid}
              helperText={fullName.length > 0 && !fullNameValid ? 'Enter at least 2 alphabetic characters' : ' '}
              fullWidth 
              required 
            />
            <TextField 
              label="Bank name" 
              value={bankName} 
              onChange={(e) => setBankName(e.target.value)} 
              error={bankName.length > 0 && !bankNameValid}
              helperText={bankName.length > 0 && !bankNameValid ? 'Enter at least 2 characters' : ' '}
              fullWidth 
              required 
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField 
              label="Account number" 
              value={accountNumber} 
              onChange={(e) => setAccountNumber(e.target.value)} 
              error={accountNumber.length > 0 && !accountValid}
              helperText={accountNumber.length > 0 && !accountValid ? '6-18 digits, no spaces' : ' '}
              fullWidth 
              required 
            />
            <TextField 
              label="SWIFT/BIC" 
              value={swiftCode} 
              onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} 
              error={swiftCode.length > 0 && !swiftValid}
              helperText={swiftCode.length > 0 && !swiftValid ? '8 or 11 characters (A-Z, 0-9)' : ' '}
              fullWidth 
              required 
            />
          </Stack>
          <Box>
            <Button startIcon={<AddIcon />} variant="contained" onClick={addBeneficiary} disabled={!isValid}>Add beneficiary</Button>
          </Box>
        </Stack>
      </Paper>

      <Paper>
        <Box p={3} borderBottom="1px solid" borderColor="divider">
          <Typography variant="h6" fontWeight={700}>Saved beneficiaries</Typography>
        </Box>
        <Box p={2}>
          {isLoading ? (
            <Alert severity="info">Loading...</Alert>
          ) : items.length === 0 ? (
            <Alert severity="info">No beneficiaries yet. Add your first one above.</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Full name</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>SWIFT/BIC</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>{b.fullName}</TableCell>
                    <TableCell>{b.bankName}</TableCell>
                    <TableCell>{mask(b.accountNumber)}</TableCell>
                    <TableCell>{b.swiftCode}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove">
                        <IconButton onClick={() => remove(b.id)} size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>
    </Stack>
  )
}


