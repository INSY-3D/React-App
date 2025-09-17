import { Component, ReactNode } from 'react'
import { logClientError } from '../lib/logger'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    logClientError(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper sx={{ p: 3, m: 2, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Something went wrong</Typography>
          <Typography color="text.secondary">Please refresh the page.</Typography>
        </Paper>
      )
    }
    return this.props.children
  }
}


