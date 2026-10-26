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
    expect(resolveOnboardingStep(profile(), 0)).toBe(1)
  })

  it("resumes at the saved step", () => {
    const named = { displayName: "Otieno", creatorType: "musician" as const }
    expect(resolveOnboardingStep(profile({ ...named, onboardingStep: 2 }), 0)).toBe(2)
    expect(resolveOnboardingStep(profile({ ...named, onboardingStep: 3 }), 2)).toBe(3)
  })

  it("never skips past a step whose data is missing", () => {
    expect(resolveOnboardingStep(profile({ onboardingStep: 3 }), 2)).toBe(1)
    expect(
      resolveOnboardingStep(
        profile({ displayName: "Otieno", creatorType: "musician", onboardingStep: 3 }),
        0
      )
    ).toBe(2)
  })

  it("reports complete once finished or skipped, regardless of step", () => {
    expect(
      resolveOnboardingStep(profile({ onboardingStep: 3, onboardingCompletedAt: "2026-10-08T10:00:00Z" }), 0)
    ).toBe("complete")
  })
})

describe("advanceOnboardingStep", () => {
  it("moves to the next step after finishing one", () => {
    expect(advanceOnboardingStep(1, 1)).toBe(2)
    expect(advanceOnboardingStep(2, 2)).toBe(3)
  })

  it("does not move saved progress backwards when an earlier step is edited", () => {
    expect(advanceOnboardingStep(3, 1)).toBe(3)
  })

  it("caps at the last step", () => {
    expect(advanceOnboardingStep(3, 3)).toBe(3)
  })
})
