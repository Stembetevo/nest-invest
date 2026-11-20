import { formatDateOnly, formatMonthKey, nairobiParts } from "./dates"
import { incomeSourceLabel, type IncomeEntry, type IncomeSource, type Profile } from "./income"
import { formatKes } from "./money"

/** `YYYY-MM` for the current month in Nairobi. */
export function currentMonthKey(now = new Date()) {
  const parts = nairobiParts(now)
  return `${parts.year}-${String(parts.month).padStart(2, "0")}`
}

export function shiftMonthKey(key: string, delta: number) {
  const [year, month] = key.split("-").map(Number)
  const index = year * 12 + (month - 1) + delta
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`
}

export function monthKeyOf(entry: Pick<IncomeEntry, "receivedOn">) {
  return entry.receivedOn.slice(0, 7)
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

export function totalForMonth(entries: IncomeEntry[], key: string) {
  return round2(
    entries.reduce((sum, entry) => (monthKeyOf(entry) === key ? sum + entry.amountKes : sum), 0)
  )
}

export type MonthChange = {
  current: number
  previous: number
  delta: number
  /** Percent change vs last month, or null when last month was zero (no meaningful baseline). */
  percent: number | null
  direction: "up" | "down" | "flat"
}

export function monthOverMonth(current: number, previous: number): MonthChange {
  const delta = round2(current - previous)
  return {
    current,
    previous,
    delta,
    percent: previous > 0 ? (delta / previous) * 100 : null,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  }
}

export function formatPercent(percent: number) {
  const abs = Math.abs(percent)
  if (abs > 0 && abs < 1) return "<1%"
  return `${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(abs)}%`
}

export function describeMonthChange(change: MonthChange) {
  if (change.current === 0 && change.previous === 0) return "Nothing logged this month or last month yet."
  if (change.direction === "flat") return "Same as last month."
  if (change.percent === null) return `Up ${formatKes(change.delta)}. Nothing was logged last month.`
  const verb = change.direction === "up" ? "Up" : "Down"
  return `${verb} ${formatKes(Math.abs(change.delta))} (${formatPercent(change.percent)}) vs last month.`
}

export type MonthTotal = { key: string; total: number }

/** Totals for the last `months` Nairobi months, oldest first, including empty months. */
export function incomeByMonth(entries: IncomeEntry[], now = new Date(), months = 6): MonthTotal[] {
  const latest = currentMonthKey(now)
  return Array.from({ length: months }, (_, index) => {
    const key = shiftMonthKey(latest, index - (months - 1))
    return { key, total: totalForMonth(entries, key) }
  })
}

export type SourceTotal = { source: IncomeSource; total: number }

/** Totals per source, largest first. Pass month keys to limit the window. */
export function incomeBySource(entries: IncomeEntry[], monthKeys?: string[]): SourceTotal[] {
  const window = monthKeys ? new Set(monthKeys) : null
  const totals = new Map<IncomeSource, number>()
  for (const entry of entries) {
    if (window && !window.has(monthKeyOf(entry))) continue
    totals.set(entry.source, (totals.get(entry.source) ?? 0) + entry.amountKes)
  }
  return [...totals.entries()]
    .map(([source, total]) => ({ source, total: round2(total) }))
    .sort((a, b) => b.total - a.total)
}

export type ProfileStepStatus = { id: string; label: string; done: boolean }

export function verifiedProfileSteps({
  profile,
  sourceCount,
  entries,
}: {
  profile: Pick<Profile, "displayName" | "creatorType">
  sourceCount: number
  entries: IncomeEntry[]
}): ProfileStepStatus[] {
  const months = new Set(entries.map(monthKeyOf))
  return [
    { id: "name", label: "Add your name", done: Boolean(profile.displayName) },
    { id: "type", label: "Choose your creator type", done: Boolean(profile.creatorType) },
    { id: "sources", label: "Pick your income sources", done: sourceCount > 0 },
    { id: "first-entry", label: "Log your first income", done: entries.length > 0 },
    { id: "two-months", label: "Log income in two different months", done: months.size >= 2 },
  ]
}

export const MANIKKA_EMPTY_INSIGHT =
  "Add your first income and I’ll start spotting patterns for you."

/** One rule-based insight from real entries. Order: month-over-month, top source, then nudges. */
export function manikkaInsight(entries: IncomeEntry[], now = new Date()) {
  if (!entries.length) return MANIKKA_EMPTY_INSIGHT

  const thisMonth = currentMonthKey(now)
  const lastMonth = shiftMonthKey(thisMonth, -1)
  const change = monthOverMonth(totalForMonth(entries, thisMonth), totalForMonth(entries, lastMonth))

  if (change.current > 0 && change.previous > 0 && change.percent !== null) {
    if (change.direction === "flat") return "You’re exactly level with last month so far. Nice and steady."
    if (change.direction === "up") {
      return `You’re up ${formatPercent(change.percent)} on last month — ${formatKes(change.delta)} more so far. Keep it going.`
    }
    return `You’re ${formatPercent(change.percent)} behind last month so far (${formatKes(Math.abs(change.delta))}). There’s still time to close the gap.`
  }

  if (change.current > 0) {
    const [top, ...rest] = incomeBySource(entries, [thisMonth])
    const label = incomeSourceLabel(top.source)
    if (!rest.length) return `All ${formatKes(change.current)} you’ve earned this month came from ${label}.`
    const share = formatPercent((top.total / change.current) * 100)
    return `${label} is your top source this month: ${formatKes(top.total)}, ${share} of what you’ve earned.`
  }

  if (change.previous > 0) {
    return `Nothing logged yet for ${formatMonthKey(thisMonth)}. Last month you earned ${formatKes(change.previous)} — add new payments as they land.`
  }

  const latest = entries.reduce((a, b) => (a.receivedOn > b.receivedOn ? a : b))
  return `Your last income was on ${formatDateOnly(latest.receivedOn)}. Add recent payments to keep your profile current.`
}
