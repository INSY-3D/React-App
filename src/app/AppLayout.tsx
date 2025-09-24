import { type PropsWithChildren, useEffect, useState } from 'react'
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
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import Footer from './Footer'
import npLogo from '../NPlogo.png'
import { useAppDispatch } from '../store'
import { logout } from '../store/authSlice'
import { performLogout } from '../lib/authCheck'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { label: 'Home', icon: <HomeRoundedIcon />, path: '/' },
  { label: 'Cards', icon: <CreditCardIcon />, path: '/cards' },
  { label: 'Pay', icon: <PaymentsRoundedIcon />, path: '/payments' },
  { label: 'Beneficiaries', icon: <GroupsRoundedIcon />, path: '/beneficiaries' },
  { label: 'Profile', icon: <AccountCircleRoundedIcon />, path: '/profile' },
]

export default function AppLayout({ children }: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentIndex = Math.max(
    0,
    navItems.findIndex((i) => i.path === location.pathname),
  )

  const THEME_KEY = 'np_theme'
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark'
    } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light') } catch {}
    document.documentElement.setAttribute('data-color-scheme', dark ? 'dark' : 'light')
  }, [dark])

  const handleLogout = async () => {
    try { await performLogout() } catch {}
    dispatch(logout())
    navigate('/login')
  }

  const pageVariants = {
    initial: { opacity: 0, y: 8, filter: 'blur(2px)' },
    in: { opacity: 1, y: 0, filter: 'blur(0px)' },
    out: { opacity: 0, y: -8, filter: 'blur(2px)' },
  }

  const pageTransition = { type: 'spring', stiffness: 260, damping: 24, mass: 0.8 }

  return (
    <Box sx={{ pb: { xs: 9, sm: 0 } }}>
      <AppBar position="sticky" color="transparent" enableColorOnDark>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <img src={npLogo} alt="NexusPay" style={{ height: 28, width: 28, borderRadius: 6 }} />
            <Typography variant="h6" fontWeight={700}>NexusPay</Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton color="inherit" onClick={() => setDark((v) => !v)}>
                {dark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton color="inherit" component={RouterLink} to="/profile">
                <AccountCircleRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {children ?? <Outlet />}
          </motion.div>
        </AnimatePresence>
      </Container>
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


