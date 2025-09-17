import DOMPurify from 'dompurify'

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

export function sanitizeText(input: string): string {
  return String(input)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .slice(0, 10000)
}
