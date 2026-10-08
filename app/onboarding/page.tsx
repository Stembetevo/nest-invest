import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { fetchProfile, fetchSources, requireUser } from "@/lib/creator-data"
import { nairobiTodayIso } from "@/lib/dates"
import { resolveOnboardingStep } from "@/lib/onboarding"

export const metadata: Metadata = { title: "Set up your profile — nest" }

export default async function OnboardingPage() {
  const { supabase, user } = await requireUser("/onboarding")
  const [profile, sources] = await Promise.all([
    fetchProfile(supabase, user.id),
    fetchSources(supabase),
  ])
  if (!profile) throw new Error("Profile missing")

  const step = resolveOnboardingStep(profile, sources.length)
  if (step === "complete") redirect("/dashboard")

  return (
    <OnboardingWizard
      initialStep={step}
      profile={{ displayName: profile.displayName ?? "", creatorType: profile.creatorType }}
      sources={sources}
      today={nairobiTodayIso()}
    />
  )
}
