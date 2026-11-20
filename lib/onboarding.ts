import type { OnboardingStep, Profile } from "./income"

export const ONBOARDING_STEPS: Record<OnboardingStep, string> = {
  1: "Your profile",
  2: "Income sources",
  3: "First entry",
}

export const ONBOARDING_STEP_COUNT = 3

/**
 * The step to show when the user returns. Uses the saved step, but never skips past a step
 * whose data is missing (for example if sources were removed after step 2 was saved).
 */
export function resolveOnboardingStep(profile: Profile, sourceCount: number): OnboardingStep | "complete" {
  if (profile.onboardingCompletedAt) return "complete"
  if (profile.onboardingStep >= 2 && (!profile.displayName || !profile.creatorType)) return 1
  if (profile.onboardingStep === 3 && sourceCount === 0) return 2
  return profile.onboardingStep
}

/** Saved progress only moves forward, so going back to edit an earlier step keeps later progress. */
export function advanceOnboardingStep(saved: OnboardingStep, finished: OnboardingStep): OnboardingStep {
  const next = Math.min(finished + 1, ONBOARDING_STEP_COUNT) as OnboardingStep
  return next > saved ? next : saved
}
