import { isCreatorType, isIncomeSource, type CreatorType, type IncomeSource } from "./income"

export type FieldErrors<K extends string> = Partial<Record<K, string>>

export const MIN_PASSWORD_LENGTH = 8
export const MAX_INCOME_KES = 100_000_000
export const MAX_NOTE_LENGTH = 200
export const MAX_NAME_LENGTH = 80

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean)
}

export function validateEmail(email: string) {
  if (!email.trim()) return "Enter your email address."
  if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address, like wanjiru@example.com."
  return undefined
}

export function validateNewPassword(password: string) {
  if (!password) return "Choose a password."
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (password.length > 72) return "Use 72 characters or fewer."
  return undefined
}

export function validateLoginForm(input: { email: string; password: string }) {
  return {
    email: validateEmail(input.email),
    password: input.password ? undefined : "Enter your password.",
  } satisfies FieldErrors<"email" | "password">
}

export function validateSignupForm(input: { email: string; password: string }) {
  return {
    email: validateEmail(input.email),
    password: validateNewPassword(input.password),
  } satisfies FieldErrors<"email" | "password">
}

export function validateResetForm(input: { password: string; confirm: string }) {
  const password = validateNewPassword(input.password)
  return {
    password,
    confirm:
      !password && input.password !== input.confirm ? "Passwords don’t match." : undefined,
  } satisfies FieldErrors<"password" | "confirm">
}

export type ProfileStepInput = { displayName: string; creatorType: string }

export function parseProfileStep(input: ProfileStepInput):
  | { ok: true; value: { displayName: string; creatorType: CreatorType } }
  | { ok: false; errors: FieldErrors<"displayName" | "creatorType"> } {
  const displayName = input.displayName.trim()
  const errors: FieldErrors<"displayName" | "creatorType"> = {}
  if (!displayName) errors.displayName = "Tell us what to call you."
  else if (displayName.length > MAX_NAME_LENGTH) {
    errors.displayName = `Keep it under ${MAX_NAME_LENGTH} characters.`
  }
  if (!isCreatorType(input.creatorType)) errors.creatorType = "Pick the option closest to your work."
  if (hasErrors(errors)) return { ok: false, errors }
  return { ok: true, value: { displayName, creatorType: input.creatorType as CreatorType } }
}

export function parseSourcesStep(sources: string[]):
  | { ok: true; value: IncomeSource[] }
  | { ok: false; error: string } {
  const unique = [...new Set(sources)]
  if (!unique.length) return { ok: false, error: "Pick at least one way you get paid." }
  if (!unique.every(isIncomeSource)) return { ok: false, error: "Pick from the listed sources." }
  return { ok: true, value: unique as IncomeSource[] }
}

export type IncomeEntryInput = {
  amount: string
  source: string
  receivedOn: string
  note: string
}

export type IncomeEntryValue = {
  amountKes: number
  source: IncomeSource
  receivedOn: string
  note: string | null
}

/** `today` is the Nairobi calendar date (`YYYY-MM-DD`) so future dates are rejected consistently. */
export function parseIncomeEntry(
  input: IncomeEntryInput,
  today: string
):
  | { ok: true; value: IncomeEntryValue }
  | { ok: false; errors: FieldErrors<keyof IncomeEntryInput> } {
  const errors: FieldErrors<keyof IncomeEntryInput> = {}
  const cleaned = input.amount.replace(/[,\s]/g, "").replace(/^(ksh|kes)/i, "")
  const amountKes = Number(cleaned)

  if (!cleaned) errors.amount = "Enter how much you received."
  else if (!Number.isFinite(amountKes) || amountKes <= 0) {
    errors.amount = "Enter an amount above KSh 0."
  } else if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    errors.amount = "Use at most 2 decimal places."
  } else if (amountKes > MAX_INCOME_KES) {
    errors.amount = "That’s above KSh 100,000,000. Check the amount."
  }

  if (!isIncomeSource(input.source)) errors.source = "Pick where this money came from."

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.receivedOn) || Number.isNaN(Date.parse(input.receivedOn))) {
    errors.receivedOn = "Pick the date you were paid."
  } else if (input.receivedOn > today) {
    errors.receivedOn = "The date can’t be in the future."
  } else if (input.receivedOn < "2000-01-01") {
    errors.receivedOn = "Pick a date from 2000 onwards."
  }

  const note = input.note.trim()
  if (note.length > MAX_NOTE_LENGTH) errors.note = `Keep notes under ${MAX_NOTE_LENGTH} characters.`

  if (hasErrors(errors)) return { ok: false, errors }
  return {
    ok: true,
    value: {
      amountKes: Math.round(amountKes * 100) / 100,
      source: input.source as IncomeSource,
      receivedOn: input.receivedOn,
      note: note || null,
    },
  }
}
