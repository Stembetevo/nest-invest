"use client"

import { PageError } from "@/components/page-states"

export default function IncomeError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <PageError
      error={error}
      retry={retry}
      title="We couldn’t load your income"
      body="Check your connection and try again. Your records are safe."
    />
  )
}
