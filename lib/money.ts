export const NEST_FEE_OF_INTEREST = 0.01
export const MIN_PLEDGE_KES = 100
export const PLEDGE_PRESETS = [100, 500, 1000, 5000] as const

export function calcReturns(
  principal: number,
  annualRate: number,
  days: number
) {
  const interest = principal * annualRate * (days / 365)
  const nestFee = interest * NEST_FEE_OF_INTEREST
  const youEarn = interest - nestFee
  return {
    interest,
    nestFee,
    youEarn,
    payout: principal + youEarn,
  }
}

export function formatKes(amount: number, fractionDigits?: number) {
  const digits =
    fractionDigits ?? (Number.isInteger(Math.round(amount * 100) / 100) && amount % 1 === 0 ? 0 : 2)
  return `KSh ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)}`
}

export function formatRate(annualRate: number) {
  return `${(annualRate * 100).toFixed(2)}%`
}

export function formatOversubscription(multiple: number) {
  return `${Math.round(multiple * 100)}% oversubscribed`
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

export function formatTenor(days: number) {
  return `${days}-day`
}
