const NAIROBI = "Africa/Nairobi"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function nairobiParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: NAIROBI,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  }
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/** Wednesday 14:00 EAT — typical CBK T-bill auction close. */
export function wednesdayCloseIso(from: Date, weeksOffset: number) {
  const parts = nairobiParts(from)
  const weekday = WEEKDAY_INDEX[parts.weekday] ?? 0
  let daysUntilWed = (3 - weekday + 7) % 7
  const pastCloseToday =
    weekday === 3 && (parts.hour > 14 || (parts.hour === 14 && parts.minute >= 0))
  if (daysUntilWed === 0 && pastCloseToday) daysUntilWed = 7
  const days = daysUntilWed + weeksOffset * 7
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day + days, 11, 0, 0)
  const shifted = new Date(utcGuess)
  const shiftedParts = nairobiParts(shifted)
  return nairobiDateIso(shiftedParts.year, shiftedParts.month, shiftedParts.day, 14, 0)
}

export function nairobiDateIso(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
) {
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+03:00`
}

export function addDaysIso(iso: string, days: number) {
  const date = new Date(iso)
  date.setUTCDate(date.getUTCDate() + days)
  const parts = nairobiParts(date)
  const original = new Date(iso)
  const originalParts = nairobiParts(original)
  return nairobiDateIso(
    parts.year,
    parts.month,
    parts.day,
    originalParts.hour,
    originalParts.minute
  )
}

export function formatLongDate(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: NAIROBI,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: NAIROBI,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

/** Today's calendar date in Nairobi as `YYYY-MM-DD`. */
export function nairobiTodayIso(now = new Date()) {
  const parts = nairobiParts(now)
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

/** Formats a `YYYY-MM-DD` calendar date, e.g. "Thu, 8 Oct 2026". */
export function formatDateOnly(date: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: NAIROBI,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00+03:00`))
}

/** Formats a `YYYY-MM` month key, e.g. "Oct 2026" (or "Oct" when short). */
export function formatMonthKey(key: string, short = false) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: NAIROBI,
    month: short ? "short" : "long",
    ...(short ? {} : { year: "numeric" }),
  }).format(new Date(`${key}-15T12:00:00+03:00`))
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: NAIROBI,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "Closed"
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${Math.max(minutes, 0)}m`
}
