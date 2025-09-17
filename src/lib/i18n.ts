export function formatZonedDate(date: Date, timeZone = 'Africa/Johannesburg', options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    ...options,
  }).format(date)
}


