import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { fetchProfile, requireUser } from "@/lib/creator-data"
import { resolveOnboardingStep } from "@/lib/onboarding"

export const metadata: Metadata = { title: "Set up your profile — nest" }

export default async function OnboardingPage() {
  const { supabase, user } = await requireUser("/onboarding")
  const profile = await fetchProfile(supabase, user.id)
  if (!profile) throw new Error("Profile missing")
  if (resolveOnboardingStep(profile) === "complete") redirect("/dashboard")

  return (
    <OnboardingWizard
      profile={{ displayName: profile.displayName ?? "", creatorType: profile.creatorType }}
    />
  )
}
