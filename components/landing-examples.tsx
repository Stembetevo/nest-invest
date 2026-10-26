"use client"

import { FormEvent, useState } from "react"
import { Switch } from "@/components/ui/switch"

export function SharingExample() {
  const [enabled, setEnabled] = useState(false)

  return (
    <article className="rounded-2xl border border-white/10 bg-card p-5 sm:p-6">
      <p className="text-sm font-medium">Sharing control — interactive example</p>
      <div className="mt-5">
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Example sharing"
          className="h-7 w-12 data-[size=default]:h-7 data-[size=default]:w-12"
        />
      </div>
      <p className="mt-5 text-sm">
        {enabled ? "On — example sharing is enabled." : "Off — example sharing is disabled."}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        This switch demonstrates a setting. It does not share or revoke real data.
      </p>
    </article>
  )
}

export function EarlyAccessForm() {
  const [email, setEmail] = useState("")

  const openDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = `My email is ${email}`
    window.location.href = `mailto:?subject=${encodeURIComponent("Manikka early access")}&body=${encodeURIComponent(body)}`
  }

  return (
    <form onSubmit={openDraft} className="mt-8 max-w-xl">
      <label htmlFor="early-email" className="text-sm">
        Your email
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id="early-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full rounded-lg border border-white/15 bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-sm"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--gold)] px-5 text-base font-medium text-primary-foreground hover:bg-[var(--gold)]/90"
        >
          Get early access
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Opens an email draft for you to send. This page does not submit a sign-up.
      </p>
    </form>
  )
}
