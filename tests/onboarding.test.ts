import { describe, expect, it } from "vitest"
import type { Profile } from "@/lib/income"
import { advanceOnboardingStep, resolveOnboardingStep } from "@/lib/onboarding"

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    accountType: "creator",
    displayName: null,
    creatorType: null,
    onboardingStep: 1,
    onboardingCompletedAt: null,
    ...overrides,
  }
}

describe("resolveOnboardingStep (resume)", () => {
  it("starts a brand new creator at step 1", () => {
    expect(resolveOnboardingStep(profile())).toBe(1)
  })

  it("treats a saved name and creator type as complete", () => {
    expect(
      resolveOnboardingStep(
        profile({ displayName: "Otieno", creatorType: "musician", onboardingStep: 2 })
      )
    ).toBe("complete")
  })

  it("stays on the profile step when the name or creator type is missing", () => {
    expect(resolveOnboardingStep(profile({ onboardingStep: 3 }))).toBe(1)
    expect(resolveOnboardingStep(profile({ displayName: "Otieno", onboardingStep: 3 }))).toBe(1)
  })

  it("reports complete once finished, regardless of step", () => {
    expect(
      resolveOnboardingStep(profile({ onboardingStep: 3, onboardingCompletedAt: "2026-10-08T10:00:00Z" }))
    ).toBe("complete")
  })
})

describe("advanceOnboardingStep", () => {
  it("stays on the only profile step", () => {
    expect(advanceOnboardingStep(1, 1)).toBe(1)
  })

  it("does not move saved progress backwards when an earlier step is edited", () => {
    expect(advanceOnboardingStep(3, 1)).toBe(3)
  })

  it("caps at the last step", () => {
    expect(advanceOnboardingStep(3, 3)).toBe(3)
  })
})
