"use server"

import { redirect, unstable_rethrow } from "next/navigation"
import { fetchProfile, insertIncomeEntry, requireUser } from "@/lib/creator-data"
import { nairobiTodayIso } from "@/lib/dates"
import type { OnboardingStep } from "@/lib/income"
import { advanceOnboardingStep } from "@/lib/onboarding"
import { parseIncomeEntry, parseProfileStep, parseSourcesStep } from "@/lib/validation"

export type OnboardingFormState = {
  ok?: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

const SAVE_FAILED = "We couldn’t save that. Check your connection and try again."

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

async function loadContext() {
  const { supabase, user } = await requireUser("/onboarding")
  const profile = await fetchProfile(supabase, user.id)
  if (!profile) throw new Error("Profile missing")
  return { supabase, user, profile }
}

async function saveProgress(finished: OnboardingStep, fields: Record<string, unknown> = {}) {
  const { supabase, user, profile } = await loadContext()
  const { error } = await supabase
    .from("profiles")
    .update({ ...fields, onboarding_step: advanceOnboardingStep(profile.onboardingStep, finished) })
    .eq("id", user.id)
  return !error
}

export async function saveProfileStep(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const parsed = parseProfileStep({
    displayName: text(formData, "displayName"),
    creatorType: text(formData, "creatorType"),
  })
  if (!parsed.ok) return { fieldErrors: parsed.errors }

  try {
    const saved = await saveProgress(1, {
      display_name: parsed.value.displayName,
      creator_type: parsed.value.creatorType,
    })
    return saved ? { ok: true } : { error: SAVE_FAILED }
  } catch (error) {
    unstable_rethrow(error)
    return { error: SAVE_FAILED }
  }
}

export async function saveSourcesStep(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const parsed = parseSourcesStep(formData.getAll("sources").map(String))
  if (!parsed.ok) return { fieldErrors: { sources: parsed.error } }

  try {
    const { supabase, user } = await loadContext()
    const removed = await supabase
      .from("income_sources")
      .delete()
      .eq("user_id", user.id)
      .not("source", "in", `(${parsed.value.join(",")})`)
    if (removed.error) return { error: SAVE_FAILED }

    const added = await supabase
      .from("income_sources")
      .upsert(
        parsed.value.map((source) => ({ user_id: user.id, source })),
        { onConflict: "user_id,source", ignoreDuplicates: true }
      )
    if (added.error) return { error: SAVE_FAILED }

    return (await saveProgress(2)) ? { ok: true } : { error: SAVE_FAILED }
  } catch (error) {
    unstable_rethrow(error)
    return { error: SAVE_FAILED }
  }
}

export async function finishOnboarding(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const skip = text(formData, "intent") === "skip"

  try {
    const { supabase, user } = await loadContext()

    if (!skip) {
      const parsed = parseIncomeEntry(
        {
          amount: text(formData, "amount"),
          source: text(formData, "source"),
          receivedOn: text(formData, "receivedOn"),
          note: text(formData, "note"),
        },
        nairobiTodayIso()
      )
      if (!parsed.ok) return { fieldErrors: parsed.errors }
      const { error } = await insertIncomeEntry(supabase, user.id, parsed.value)
      if (error) return { error: SAVE_FAILED }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_step: 3, onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id)
    if (error) return { error: SAVE_FAILED }
  } catch (error) {
    unstable_rethrow(error)
    return { error: SAVE_FAILED }
  }

  redirect("/dashboard")
}
