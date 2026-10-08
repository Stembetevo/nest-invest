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
