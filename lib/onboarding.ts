import type { OnboardingStep, Profile } from "./income"

export const ONBOARDING_STEPS: Record<1, string> = {
  1: "Your profile",
}

export const ONBOARDING_STEP_COUNT = 1

/** Profile name and creator type are enough. A saved completion stamp also counts. */
export function resolveOnboardingStep(profile: Profile): OnboardingStep | "complete" {
  if (profile.onboardingCompletedAt || (profile.displayName && profile.creatorType)) return "complete"
  return 1
}

/** Saved progress only moves forward, so going back to edit an earlier step keeps later progress. */
export function advanceOnboardingStep(saved: OnboardingStep, finished: OnboardingStep): OnboardingStep {
  const next = Math.min(finished + 1, ONBOARDING_STEP_COUNT) as OnboardingStep
  return next > saved ? next : saved
}
