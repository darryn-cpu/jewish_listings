export function formatRefCode(year: number, value: number) {
  return `JBD-${year}-${String(value).padStart(4, "0")}`
}

export function isRefCode(value: string) {
  return /^JBD-\d{4}-\d{4,}$/.test(value)
}
