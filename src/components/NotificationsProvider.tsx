import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

type Notification = { message: string; severity?: 'success' | 'info' | 'warning' | 'error' }
type Ctx = { notify: (n: Notification) => void }

const NotificationsContext = createContext<Ctx>({ notify: () => {} })

export function useNotifications() {
  return useContext(NotificationsContext)
}

export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [notif, setNotif] = useState<Notification>({ message: '' })

  const notify = useCallback((n: Notification) => {
    setNotif(n)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={notif.severity || 'info'} sx={{ width: '100%' }}>
          {notif.message}
        </Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  )
}


