import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppSelector } from '../store'

interface SessionConfig {
  warningMinutes: number // Show warning N minutes before expiry
  sessionLengthMinutes: number // Total session length
}

const DEFAULT_CONFIG: SessionConfig = {
  warningMinutes: 5,
  sessionLengthMinutes: 15 // Task 2 Compliant: 15-minute sessions
}

export function useSessionManager(config: SessionConfig = DEFAULT_CONFIG) {
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const [showWarning, setShowWarning] = useState(false)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number>(0)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activityListeners = useRef<boolean>(false)

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    const now = Date.now()
    setLastActivity(now)
    
    // Reset session expiry time based on new activity
    const newExpiresAt = now + (config.sessionLengthMinutes * 60 * 1000)
    setSessionExpiresAt(newExpiresAt)
    
    // Clear any existing warning
    setShowWarning(false)
    
    // Clear existing timer and set new one
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
    
    // Set timer to show warning before expiry
    const timeUntilWarning = (config.sessionLengthMinutes - config.warningMinutes) * 60 * 1000
    
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
    }, timeUntilWarning)
  }, [config.sessionLengthMinutes, config.warningMinutes])

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated || activityListeners.current) return

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Throttle activity updates to avoid excessive calls
    let throttleTimer: ReturnType<typeof setTimeout> | null = null
    const throttledUpdateActivity = () => {
      if (throttleTimer) return
      
      throttleTimer = setTimeout(() => {
        updateActivity()
        throttleTimer = null
      }, 30000) // Update at most every 30 seconds
    }

    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, true)
    })

    activityListeners.current = true

    // Initial session setup
    updateActivity()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity, true)
      })
      activityListeners.current = false
      
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
      }
    }
  }, [isAuthenticated, updateActivity])

  // Reset timers when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false)
      setSessionExpiresAt(0)
      setLastActivity(0)
      
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
      }
    }
  }, [isAuthenticated])

  const extendSession = useCallback(() => {
    updateActivity()
  }, [updateActivity])

  const closeWarning = useCallback(() => {
    setShowWarning(false)
  }, [])

  return {
    showWarning,
    sessionExpiresAt,
    lastActivity,
    extendSession,
    closeWarning,
    isSessionActive: isAuthenticated && sessionExpiresAt > Date.now()
  }
}
