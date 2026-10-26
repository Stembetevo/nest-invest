import type { IncomeMonth, IncomeSource as ReportIncomeSource } from "./types"

export const SAMPLE_REPORT = {
  name: "Amina K.",
  place: "Nairobi",
  monthlyIncome: 42600,
  score: 81,
  months: [
    { label: "May", inflow: 38200 },
    { label: "Jun", inflow: 41400 },
    { label: "Jul", inflow: 39800 },
    { label: "Aug", inflow: 45100 },
    { label: "Sep", inflow: 43900 },
    { label: "Oct", inflow: 47200 },
  ] satisfies IncomeMonth[],
  sources: [
    { name: "Till and paybill", share: 48 },
    { name: "Person to person", share: 31 },
    { name: "Regular payer", share: 21 },
  ] satisfies ReportIncomeSource[],
}

function hashPhone(phone: string) {
  let hash = 2166136261
  for (const char of phone) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function recentMonthLabels(count = 6) {
  const labels: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(date.toLocaleString("en-KE", { month: "short" }))
  }
  return labels
}

export function buildReport(phone: string) {
  const hash = hashPhone(phone)
  const base = 22000 + (hash % 48000)
  const months: IncomeMonth[] = recentMonthLabels().map((label, index) => {
    const wobble = 0.84 + ((hash >> (index * 3)) % 28) / 100
    const inflow = Math.round((base * wobble) / 100) * 100
    return { label, inflow }
  })
  const monthlyIncome =
    Math.round(months.reduce((sum, month) => sum + month.inflow, 0) / months.length / 100) * 100
  const mean = months.reduce((sum, month) => sum + month.inflow, 0) / months.length
  const deviation = Math.sqrt(
    months.reduce((sum, month) => sum + (month.inflow - mean) ** 2, 0) / months.length
  )
  const score = Math.round(Math.min(94, Math.max(64, 96 - (deviation / mean) * 180)))
  const till = 36 + (hash % 18)
  const person = 18 + ((hash >> 5) % 16)
  const sources: ReportIncomeSource[] = [
    { name: "Till and paybill", share: till },
    { name: "Person to person", share: person },
    { name: "Regular payer", share: 100 - till - person },
  ]
  return { monthlyIncome, score, months, sources }
}

export function reportCode(phone: string) {
  return `MNK-${hashPhone(phone).toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`
}

export const CREATOR_TYPES = [
  { value: "filmmaker", label: "Filmmaker" },
  { value: "youtuber", label: "YouTuber" },
  { value: "musician", label: "Musician" },
  { value: "designer", label: "Designer" },
  { value: "other", label: "Other" },
] as const

export type CreatorType = (typeof CREATOR_TYPES)[number]["value"]

export const INCOME_SOURCES = [
  { value: "brand_deals", label: "Brand deals" },
  { value: "youtube", label: "YouTube" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "clients", label: "Clients" },
  { value: "other", label: "Other" },
] as const

export type IncomeSource = (typeof INCOME_SOURCES)[number]["value"]

export type OnboardingStep = 1 | 2 | 3

export type Profile = {
  id: string
  accountType: "creator"
  displayName: string | null
  creatorType: CreatorType | null
  onboardingStep: OnboardingStep
  onboardingCompletedAt: string | null
}

export type IncomeEntry = {
  id: string
  amountKes: number
  source: IncomeSource
  /** Calendar date in Nairobi, `YYYY-MM-DD`. */
  receivedOn: string
  note: string | null
  createdAt: string
}

export function isCreatorType(value: unknown): value is CreatorType {
  return CREATOR_TYPES.some((item) => item.value === value)
}

export function isIncomeSource(value: unknown): value is IncomeSource {
  return INCOME_SOURCES.some((item) => item.value === value)
}

export function incomeSourceLabel(source: IncomeSource) {
  return INCOME_SOURCES.find((item) => item.value === source)?.label ?? source
}

export function creatorTypeLabel(type: CreatorType) {
  return CREATOR_TYPES.find((item) => item.value === type)?.label ?? type
}

type ProfileRow = {
  id: string
  account_type: string
  display_name: string | null
  creator_type: string | null
  onboarding_step: number
  onboarding_completed_at: string | null
}

type IncomeEntryRow = {
  id: string
  amount_kes: number | string
  source: string
  received_on: string
  note: string | null
  created_at: string
}

export function toProfile(row: ProfileRow): Profile {
  const step = Number(row.onboarding_step)
  return {
    id: row.id,
    accountType: "creator",
    displayName: row.display_name,
    creatorType: isCreatorType(row.creator_type) ? row.creator_type : null,
    onboardingStep: step === 2 || step === 3 ? step : 1,
    onboardingCompletedAt: row.onboarding_completed_at,
  }
}

export function toIncomeEntry(row: IncomeEntryRow): IncomeEntry {
  return {
    id: row.id,
    amountKes: Number(row.amount_kes),
    source: isIncomeSource(row.source) ? row.source : "other",
    receivedOn: row.received_on,
    note: row.note,
    createdAt: row.created_at,
  }
}

export const PROFILE_COLUMNS =
  "id, account_type, display_name, creator_type, onboarding_step, onboarding_completed_at"
export const ENTRY_COLUMNS = "id, amount_kes, source, received_on, note, created_at"
