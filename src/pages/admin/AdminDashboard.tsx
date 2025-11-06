import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Chip, Divider, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableRow, TableCell, IconButton } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import api from '../../lib/apiClient'

type Staff = { id: string; fullName: string; email?: string; staffId: string; isActive: boolean; createdAt: string }

export default function AdminDashboard() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: '', staffId: '', email: '', password: '' })

  const stats = useMemo(() => {
    const total = staff.length
    const active = staff.filter(s => s.isActive).length
    const inactive = total - active
    return { total, active, inactive }
  }, [staff])

  const fetchStaff = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (q) params.q = q
      if (status !== 'all') params.status = status
      const res = await api.get('/admin/staff', { params })
      setStaff(res?.data?.data?.items || [])
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStaff() }, [])

  const openCreate = () => { setEditingId(null); setForm({ fullName: '', staffId: '', email: '', password: '' }); setDialogOpen(true) }
  const openEdit = (row: any) => { setEditingId(row.id); setForm({ fullName: '', staffId: '', email: '', password: '' }); setDialogOpen(true) }

  const submitDialog = async () => {
    try {
      if (editingId) {
        await api.patch(`/admin/staff/${editingId}`, { fullName: form.fullName || undefined, email: form.email || undefined, password: form.password || undefined })
      } else {
        await api.post('/admin/staff', { fullName: form.fullName, staffId: form.staffId, email: form.email, password: form.password || undefined })
      }
      setDialogOpen(false)
      await fetchStaff()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Action failed')
    }
  }

  const deleteStaff = async (row: Staff) => {
    if (!confirm('Delete staff? Access will be revoked.')) return
    try {
      await api.delete(`/admin/staff/${row.id}`)
      await fetchStaff()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete staff')
    }
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>Manage staff accounts and access</Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Staff</Button>
        <TextField size="small" label="Search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') fetchStaff() }} />
        <Button size="small" onClick={() => { setStatus('all'); fetchStaff() }}>All</Button>
        <Button size="small" onClick={() => { setStatus('active'); fetchStaff() }}>Active</Button>
        <Button size="small" onClick={() => { setStatus('inactive'); fetchStaff() }}>Inactive</Button>
        {loading && <Chip label="Loading..." />}
        {error && <Chip color="error" label={error} />}
      </Stack>

      {/* Simple bar "chart" */}
      <Box display="flex" gap={2} mb={2}>
        {[{ label: 'Total', value: stats.total, color: '#1976d2' }, { label: 'Active', value: stats.active, color: '#2e7d32' }, { label: 'Inactive', value: stats.inactive, color: '#d32f2f' }].map((s) => (
          <Box key={s.label} flex={1} p={2} borderRadius={1} bgcolor="#f5f5f5">
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            <Box mt={1} height={12} bgcolor="#e0e0e0" borderRadius={6}>
              <Box height="100%" width={`${stats.total ? Math.round((s.value / Math.max(1, stats.total)) * 100) : 0}%`} bgcolor={s.color} borderRadius={6} />
            </Box>
            <Typography variant="h6" mt={1}>{s.value}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Staff ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staff.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.fullName || '-'}</TableCell>
              <TableCell>{row.email || '-'}</TableCell>
              <TableCell>{row.staffId || '-'}</TableCell>
              <TableCell>{row.isActive ? <Chip size="small" color="success" label="Active" /> : <Chip size="small" color="default" label="Inactive" />}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(row)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => deleteStaff(row)} title="Delete"><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Staff' : 'Create Staff'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {!editingId && <TextField label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />}
            {!editingId && <TextField label="Staff ID" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} required />}
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField type="password" label="Password (optional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitDialog}>{editingId ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}


