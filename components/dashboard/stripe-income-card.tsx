"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  connected: boolean
  accountId?: string
  initialError?: string
}

export function StripeIncomeCard({ connected, accountId, initialError }: Props) {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle")
  const [message, setMessage] = useState(initialError ?? "")

  async function sync() {
    setStatus("syncing")
    setMessage("")
    const response = await fetch("/api/stripe/sync", { method: "POST" })
    const payload = (await response.json()) as { imported?: number; income?: number; currency?: string; error?: string }
    if (!response.ok) {
      setStatus("error")
      setMessage(payload.error ?? "We couldn’t sync Stripe transactions.")
      return
    }
    setStatus("done")
    setMessage(
      `Imported ${payload.imported ?? 0} transactions${payload.currency ? ` (${payload.currency.toUpperCase()})` : ""}.`
    )
  }

  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Stripe income history</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {connected
              ? `Connected account ${accountId?.slice(0, 12)}…`
              : "Connect Stripe to import real balance transactions as income evidence."}
          </p>
        </div>
        {connected ? (
          <Button type="button" onClick={sync} disabled={status === "syncing"}>
            {status === "syncing" ? "Syncing…" : "Sync transactions"}
          </Button>
        ) : (
          <Button asChild>
            <a href="/api/stripe/connect">Connect Stripe</a>
          </Button>
        )}
      </div>
      {message ? (
        <p className={`mt-3 text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message}
        </p>
      ) : null}
    </section>
  )
}
