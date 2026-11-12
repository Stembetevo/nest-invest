"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Transaction = {
  stripe_transaction_id: string
  transaction_type: string
  amount: number
  fee: number
  net: number
  currency: string
  status: string
  available_on: string
  stripe_created_at: string
  description: string | null
}

type Summary = { in: number; out: number }
type HistoryPayload = { data?: Transaction[]; summary?: Summary; error?: string }

function formatAmount(amount: number, currency: string, masked: boolean) {
  if (masked) return "••••••"
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

export function StripeIncomeCard({ connected, accountId, initialError, setupMessage }: {
  connected: boolean
  accountId?: string
  initialError?: string
  setupMessage?: string | null
}) {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle")
  const [message, setMessage] = useState(initialError ?? "")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary>({ in: 0, out: 0 })
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [masked, setMasked] = useState(false)

  async function loadHistory() {
    const params = new URLSearchParams({ limit: "100" })
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    const response = await fetch(`/api/stripe/transactions?${params}`)
    const payload = (await response.json()) as HistoryPayload
    if (!response.ok) throw new Error(payload.error ?? "Could not load Stripe transaction history.")
    setTransactions(payload.data ?? [])
    setSummary(payload.summary ?? { in: 0, out: 0 })
  }

  useEffect(() => {
    if (!connected) return
    loadHistory().catch((error: unknown) => {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Could not load Stripe transaction history.")
    })
  }, [connected])

  async function sync() {
    setStatus("syncing")
    setMessage("")
    const response = await fetch("/api/stripe/sync", { method: "POST" })
    const payload = (await response.json()) as { imported?: number; currency?: string; error?: string }
    if (!response.ok) {
      setStatus("error")
      setMessage(payload.error ?? "We couldn’t sync Stripe transactions.")
      return
    }
    await loadHistory()
    setStatus("done")
    setMessage(
      `Imported ${payload.imported ?? 0} transactions${payload.currency ? ` (${payload.currency.toUpperCase()})` : ""}.`
    )
  }

  async function applyFilters() {
    try {
      await loadHistory()
      setMessage("")
    } catch (error: unknown) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Could not load Stripe transaction history.")
    }
  }

  if (!connected) {
    return (
      <section className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
        <p className="text-sm font-semibold">Stripe income history</p>
        <p className="mt-1 text-sm text-muted-foreground">Connect Stripe to import income evidence.</p>
        {setupMessage ? <p className="mt-2 text-sm text-destructive">{setupMessage}</p> : null}
        {message && message !== setupMessage ? (
          <p className="mt-2 text-sm text-destructive">{message}</p>
        ) : null}
        <Button asChild className="mt-3"><a href="/api/stripe/connect">Connect Stripe</a></Button>
      </section>
    )
  }

  const currency = transactions[0]?.currency ?? "usd"
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Stripe income proof</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Connected account {accountId?.slice(0, 12)}… · balance transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMasked((value) => !value)}>
              {masked ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              {masked ? "Show amounts" : "Mask privacy"}
            </Button>
            <Button type="button" size="sm" onClick={sync} disabled={status === "syncing"}>
              {status === "syncing" ? "Syncing…" : "Sync"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">Money in</p>
            <p className="mt-1 font-semibold">{formatAmount(summary.in, currency, masked)}</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">Money out</p>
            <p className="mt-1 font-semibold">{formatAmount(summary.out, currency, masked)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted-foreground">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block h-8 rounded-md border bg-background px-2 text-sm" /></label>
          <label className="text-xs text-muted-foreground">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block h-8 rounded-md border bg-background px-2 text-sm" /></label>
          <Button type="button" variant="outline" size="sm" onClick={applyFilters}>Apply dates</Button>
        </div>
        {message ? <p className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>{message}</p> : null}
        {transactions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground"><tr><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Description</th><th className="py-2 text-right">Net</th></tr></thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.stripe_transaction_id} className="border-b last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(transaction.stripe_created_at).toLocaleDateString()}</td>
                    <td className="max-w-48 truncate py-2 pr-3">{masked ? "••••••" : transaction.description ?? transaction.transaction_type}</td>
                    <td className={`py-2 text-right font-medium ${transaction.net >= 0 ? "text-emerald-700" : "text-destructive"}`}>{formatAmount(Math.abs(transaction.net), transaction.currency, masked)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-muted-foreground">No synced transactions for this period. Sync Stripe to refresh the history.</p>}
      </CardContent>
    </Card>
  )
}
