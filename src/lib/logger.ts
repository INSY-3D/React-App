type SafeError = {
  name?: string
  message?: string
  stack?: string
}

export function logClientError(err: unknown) {
  const safe: SafeError = {}
  if (err && typeof err === 'object') {
    const anyErr: any = err
    safe.name = String(anyErr.name || 'Error')
    safe.message = String(anyErr.message || 'Unknown error')
    safe.stack = String(anyErr.stack || '')
  } else {
    safe.message = String(err)
  }
  // TODO: send to monitoring endpoint without PII
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error('[client-error]', safe)
  }
}


