"use client"

import { useEffect, useRef, useState } from "react"
import type { IncomeSource, OnboardingStep } from "@/lib/income"
import { FirstEntryStep } from "./first-entry-step"
import { ProfileStep, type ProfileValues } from "./profile-step"
import { SourcesStep } from "./sources-step"
import { StepProgress } from "./step-progress"

const HEADINGS: Record<OnboardingStep, { title: string; body: string }> = {
  1: { title: "Let’s set up your profile", body: "Two quick details so your dashboard feels like yours." },
  2: { title: "How do you get paid?", body: "We’ll group your income by these sources." },
  3: { title: "Add your first income", body: "Or skip and add it later from your dashboard." },
}

export function OnboardingWizard({
  initialStep,
  profile,
  sources: initialSources,
  today,
}: {
  initialStep: OnboardingStep
  profile: ProfileValues
  sources: IncomeSource[]
  today: string
}) {
  const [step, setStep] = useState<OnboardingStep>(initialStep)
  const [values, setValues] = useState(profile)
  const [sources, setSources] = useState(initialSources)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const heading = HEADINGS[step]

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <StepProgress step={step} />
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="font-heading text-3xl tracking-tight outline-none">
          {heading.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{heading.body}</p>
      </div>
      <div className="rounded-3xl bg-card px-5 py-6 ring-1 ring-foreground/10">
        {step === 1 ? (
          <ProfileStep
            initial={values}
            onDone={(next) => {
              setValues(next)
              setStep(2)
            }}
          />
        ) : step === 2 ? (
          <SourcesStep
            initial={sources}
            onBack={() => setStep(1)}
            onDone={(next) => {
              setSources(next)
              setStep(3)
            }}
          />
        ) : (
          <FirstEntryStep today={today} sources={sources} onBack={() => setStep(2)} />
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Your progress is saved after each step. You can leave and pick up where you stopped.
      </p>
    </div>
  )
}
