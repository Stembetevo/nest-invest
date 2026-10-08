"use client"

import { PageError } from "@/components/page-states"

export default function OnboardingError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <PageError
      error={error}
      retry={retry}
      title="We couldn’t load your setup"
      body="Check your connection and try again. Anything you already saved is safe."
    />
  )
}
