"use client"

import { useRef } from "react"
import { ProfileStep, type ProfileValues } from "./profile-step"
import { StepProgress } from "./step-progress"

export function OnboardingWizard({ profile }: { profile: ProfileValues }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  return (
<<<<<<< HEAD
    <div className="mx-auto w-full max-w-lg space-y-8">
      <StepProgress step={step} />
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="font-heading text-4xl tracking-tight outline-none">
          {heading.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{heading.body}</p>
      </div>
      <div className="surface rounded-3xl px-6 py-8 sm:px-8">
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
=======
    <div className="mx-auto w-full max-w-md space-y-6">
      <StepProgress />
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="font-heading text-3xl tracking-tight outline-none">
          Let’s set up your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Two quick details, then you can link a bank or a Stripe account.
        </p>
      </div>
      <div className="rounded-3xl bg-card px-5 py-6 ring-1 ring-foreground/10">
        <ProfileStep initial={profile} />
>>>>>>> 60312ee4137d9795bcbd5d6d2105e910b070e91f
      </div>
    </div>
  )
}
