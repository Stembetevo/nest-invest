export function formatKes(amount: number, fractionDigits?: number) {
  const digits =
    fractionDigits ?? (Number.isInteger(amount) ? 0 : 2)
  return `KSh ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)}`
}

export function normalizeKenyanPhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("254") && digits.length === 12) return digits
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`
  if (digits.length === 9 && digits.startsWith("7")) return `254${digits}`
  return digits
}

export function isValidKenyanPhone(raw: string) {
  const normalized = normalizeKenyanPhone(raw)
  return /^2547\d{8}$/.test(normalized)
}

export function displayPhone(raw: string) {
  const normalized = normalizeKenyanPhone(raw)
  if (!/^2547\d{8}$/.test(normalized)) return raw
  return `0${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`
}
