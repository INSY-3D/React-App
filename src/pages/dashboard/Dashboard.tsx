// import Grid from '@mui/material/Grid' // Using Box for layout instead
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import { allowList, validateAllowList } from '../../lib/validation'
import { useState } from 'react'
import { useNotifications } from '../../components/NotificationsProvider'
import { useAppSelector } from '../../store'

function maskAccount(n: string) {
  return n.replace(/\d(?=\d{4})/g, '*')
}

export default function Dashboard() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('ZAR')
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('')
  const [swift, setSwift] = useState('')
  const { notify } = useNotifications()
  
  // Get user data and login state from Redux
  const { user, isFirstLogin } = useAppSelector((state) => state.auth)
  
  // Create welcome message based on first login status
  const welcomeMessage = isFirstLogin 
    ? 'Welcome' 
    : `Welcome back${user?.fullName ? `, ${user.fullName}` : ''}`

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={800}>{welcomeMessage}</Typography>
        <Typography variant="body2" color="text.secondary">Create payments, manage beneficiaries, and track statuses.</Typography>
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} justifyContent="center">
        <Box sx={{ flex: { xs: 1, md: '0 0 400px' }, maxWidth: { md: '400px' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700}>Create payment</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <TextField label="Amount" type="number" inputProps={{ min: 0, step: '0.01' }} value={amount} onChange={(e) => setAmount(e.target.value)} />
              <TextField label="Currency" select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {['ZAR', 'USD', 'EUR', 'GBP'].map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
              <TextField label="Provider" select defaultValue="SWIFT">
                {['SWIFT'].map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
              <Box>
                <Button variant="contained" onClick={() => {
                  if (!amount || Number(amount) <= 0) return
                  notify({ severity: 'success', message: 'Payment submitted' })
                }}>Submit payment</Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: 1, md: '0 0 400px' }, maxWidth: { md: '400px' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700}>Add beneficiary</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <TextField label="Beneficiary name" value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} />
              <TextField label="Account number" value={beneficiaryAccount} onChange={(e) => setBeneficiaryAccount(e.target.value)} />
              <TextField label="SWIFT/BIC" value={swift} onChange={(e) => setSwift(e.target.value.toUpperCase())} />
              <Box>
                <Button variant="outlined" onClick={() => {
                  if (!validateAllowList(beneficiaryName, allowList.fullName)) return
                  if (!validateAllowList(beneficiaryAccount, allowList.accountNumber)) return
                  if (!validateAllowList(swift, allowList.swift)) return
                  notify({ severity: 'success', message: 'Beneficiary added' })
                }}>Add beneficiary</Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700}>Payments</Typography>
        <Divider sx={{ my: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Reference</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[{ref:'P-0001',name:'Acme',account:'1234567890',status:'Pending Verification'}].map((p) => (
                <TableRow key={p.ref} hover>
                  <TableCell>{p.ref}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{maskAccount(p.account)}</TableCell>
                  <TableCell>{p.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  )
}


