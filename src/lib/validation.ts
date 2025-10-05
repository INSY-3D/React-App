export const allowList = {
  fullName: /^[A-Za-z ,.'-]{2,}$/,
  saId: /^\d{13}$/,
  accountNumber: /^(\d{6,18}|\*{4,}\d{4})$/, // Allow digits or masked format (****1234)
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Relaxed SWIFT/BIC: accept any 8 or 11 alphanumeric (bank/country specifics validated server-side)
  swift: /^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$/,
  // Staff validation (Task 2 Compliant)
  staffId: /^[A-Z0-9-]{3,20}$/,
  // International payment validations
  iban: /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/,
  sortCode: /^\d{6}$/,
  routingNumber: /^\d{9}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  reference: /^[A-Za-z0-9\s\-\.]{1,35}$/,
  // Address validation for international payments
  address: /^[A-Za-z0-9\s,.'"\-]{1,70}$/,
  city: /^[A-Za-z\s,.'"\-]{1,35}$/,
  postalCode: /^[A-Za-z0-9\s\-]{1,16}$/,
  country: /^[A-Za-z\s]{2,56}$/,
}

export function validateAllowList(value: string, regex: RegExp): boolean {
  return regex.test(value)
}

export function maskAccountNumber(value: string): string {
  return value.replace(/\d(?=\d{4})/g, '*')
}

export function isStrongPassword(value: string): boolean {
  return (
    value.length >= 12 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}

// International payment validation functions
export function validateSWIFTCode(swift: string): boolean {
  const normalized = swift.replace(/\s/g, '').toUpperCase()
  return allowList.swift.test(normalized)
}

export function validateIBAN(iban: string): boolean {
  const normalized = iban.replace(/\s/g, '').toUpperCase()
  if (!allowList.iban.test(normalized)) return false
  
  // Basic IBAN checksum validation (simplified)
  const rearranged = normalized.slice(4) + normalized.slice(0, 4)
  const numberString = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 65 + 10).toString()
  )
  
  // Simple modulo 97 check
  let remainder = 0
  for (let i = 0; i < numberString.length; i++) {
    remainder = (remainder * 10 + parseInt(numberString[i])) % 97
  }
  return remainder === 1
}

export function validateAmount(amount: string, min = 0.01, max = 999999.99): boolean {
  if (!allowList.amount.test(amount)) return false
  const numAmount = parseFloat(amount)
  return numAmount >= min && numAmount <= max
}

export function formatSWIFT(swift: string): string {
  return swift.replace(/\s/g, '').toUpperCase()
}

export function formatIBAN(iban: string): string {
  const normalized = iban.replace(/\s/g, '').toUpperCase()
  return normalized.replace(/(.{4})/g, '$1 ').trim()
}

// Currency and country validation
export const supportedCurrencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ZAR', 'SEK'
] as const

export const swiftCountries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'ZA', name: 'South Africa' }
] as const

export function validateCurrency(currency: string): boolean {
  return supportedCurrencies.includes(currency as any)
}

export function validateCountryCode(countryCode: string): boolean {
  return swiftCountries.some(country => country.code === countryCode)
}

// Currency symbol mapping
export const currencySymbols: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'ZAR': 'R',
  'SEK': 'kr'
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency
}


