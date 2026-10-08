"use client"

import { PageError } from "@/components/page-states"

export default function DashboardError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <PageError
      error={error}
      retry={retry}
      title="We couldn’t load your dashboard"
      body="Check your connection and try again. Your income records are safe."
    />
  )
}
