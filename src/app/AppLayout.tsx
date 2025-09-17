import { PropsWithChildren } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Footer from './Footer'
import npLogo from '../NPlogo.png'

const navItems = [
  { label: 'Home', icon: <HomeRoundedIcon />, path: '/' },
  { label: 'Cards', icon: <CreditCardIcon />, path: '/cards' },
  { label: 'Pay', icon: <PaymentsRoundedIcon />, path: '/payments' },
  { label: 'Profile', icon: <AccountCircleRoundedIcon />, path: '/profile' },
]

export default function AppLayout({ children }: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentIndex = Math.max(
    0,
    navItems.findIndex((i) => i.path === location.pathname),
  )

  return (
    <Box sx={{ pb: { xs: 9, sm: 0 } }}>
      <AppBar position="sticky" color="transparent" enableColorOnDark>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <img src={npLogo} alt="NexusPay" style={{ height: 28, width: 28, borderRadius: 6 }} />
            <Typography variant="h6" fontWeight={700}>NexusPay</Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>{children ?? <Outlet />}</Container>
      <Footer />
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { xs: 'block', sm: 'none' } }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={currentIndex}
          onChange={(_, newValue) => navigate(navItems[newValue].path)}
        >
          {navItems.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}


