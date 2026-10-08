import type { OnboardingStep } from "@/lib/income"
import { ONBOARDING_STEP_COUNT, ONBOARDING_STEPS } from "@/lib/onboarding"

export function StepProgress({ step }: { step: OnboardingStep }) {
  const label = `Step ${step} of ${ONBOARDING_STEP_COUNT}`
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        <span>{ONBOARDING_STEPS[step]}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={1}
        aria-valuemax={ONBOARDING_STEP_COUNT}
        aria-valuenow={step}
        aria-valuetext={`${label}: ${ONBOARDING_STEPS[step]}`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${(step / ONBOARDING_STEP_COUNT) * 100}%` }}
        />
      </div>
    </div>
  )
}
