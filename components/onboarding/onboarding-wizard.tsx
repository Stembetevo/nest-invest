"use client"

import { useRef } from "react"
import { ProfileStep, type ProfileValues } from "./profile-step"
import { StepProgress } from "./step-progress"

export function OnboardingWizard({ profile }: { profile: ProfileValues }) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  return (
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
      </div>
    </div>
  )
}
