"use client"

import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BankAccountView, BankSnapshot, BankTransactionView } from "@/lib/bank-snapshot"
import { formatMinor, type CreditAssessment } from "@/lib/creditworthiness"

const VERDICT_LABEL: Record<CreditAssessment["verdict"], string> = {
  pending: "Still collecting",
  insufficient: "Not enough history",
  weak: "Weak",
  thin: "Thin",
  moderate: "Moderate",
  strong: "Strong",
}

function money(amount: number | null, currency: string | null, masked: boolean) {
  if (amount === null || !currency) return "—"
  if (masked) return "••••••"
  return formatMinor(amount, currency)
}

export function BankAccountsCard({ initial }: { initial: BankSnapshot }) {
  const [snapshot, setSnapshot] = useState(initial)
  const [status, setStatus] = useState<"idle" | "linking" | "syncing" | "error">("idle")
  const [message, setMessage] = useState("")
  const [masked, setMasked] = useState(true)

  useEffect(() => {
    if (!snapshot.refreshPending) return
    let cancelled = false
    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      if (attempts > 20) {
        window.clearInterval(timer)
        return
      }
      void fetch("/api/stripe/financial-connections")
        .then(async (response) => {
          const payload = (await response.json()) as BankSnapshot & { error?: string }
          if (!response.ok) throw new Error(payload.error ?? "Could not load bank accounts.")
          if (!cancelled) setSnapshot(payload)
        })
        .catch(() => undefined)
    }, 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [snapshot.refreshPending])

  async function link() {
    setStatus("linking")
    setMessage("")
    try {
      const sessionResponse = await fetch("/api/stripe/financial-connections/session", { method: "POST" })
      const session = (await sessionResponse.json()) as {
        clientSecret?: string
        publishableKey?: string | null
        sessionId?: string
        error?: string
      }
      if (!sessionResponse.ok || !session.clientSecret || !session.publishableKey || !session.sessionId) {
        throw new Error(session.error ?? "Stripe did not start a bank-link session.")
      }

      const stripe = await loadStripe(session.publishableKey)
      if (!stripe) throw new Error("Stripe.js could not load.")
      const result = await stripe.collectFinancialConnectionsAccounts({ clientSecret: session.clientSecret })
      if (result.error) throw new Error(result.error.message ?? "The bank link was cancelled.")

      setStatus("syncing")
      const syncResponse = await fetch("/api/stripe/financial-connections/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: result.financialConnectionsSession?.id ?? session.sessionId }),
      })
      const synced = (await syncResponse.json()) as BankSnapshot & { error?: string }
      if (!syncResponse.ok) throw new Error(synced.error ?? "Could not save the linked accounts.")
      setSnapshot(synced)
      setStatus("idle")
      setMessage(
        synced.refreshPending
          ? "Account linked. Stripe is still collecting balances and transactions."
          : "Account linked."
      )
    } catch (error: unknown) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "The bank link failed.")
    }
  }

  async function sync() {
    setStatus("syncing")
    setMessage("")
    try {
      const response = await fetch("/api/stripe/financial-connections/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
      const payload = (await response.json()) as BankSnapshot & { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Could not refresh bank data.")
      setSnapshot(payload)
      setStatus("idle")
      setMessage(payload.refreshPending ? "Refresh started. New data appears when the bank finishes." : "Bank data updated.")
    } catch (error: unknown) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Could not refresh bank data.")
    }
  }

  if (!snapshot.configured) {
    return (
      <section className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
        <p className="text-sm font-semibold">Bank balances and transactions</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a Stripe publishable key and secret key to let people link a bank account for a credit read.
        </p>
      </section>
    )
  }

  if (!snapshot.linked) {
    return (
      <section className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
        <p className="text-sm font-semibold">Bank balances and transactions</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Link a checking or savings account. Stripe collects consent, then Manikka reads balances and posted
          transactions to estimate creditworthiness.
        </p>
        {snapshot.setupMessage ? <p className="mt-2 text-sm text-destructive">{snapshot.setupMessage}</p> : null}
        <Button type="button" className="mt-3" onClick={link} disabled={status === "linking" || status === "syncing"}>
          {status === "linking" ? "Opening Stripe…" : status === "syncing" ? "Saving accounts…" : "Link bank account"}
        </Button>
        {message ? (
          <p className={`mt-2 text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>{message}</p>
        ) : null}
      </section>
    )
  }

  const assessment = snapshot.assessment
  const currency = assessment?.currency ?? snapshot.accounts.find((account) => account.currency)?.currency ?? null

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Bank credit read</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Balances and transactions from accounts linked through Stripe Financial Connections.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMasked((value) => !value)}>
              {masked ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              {masked ? "Show amounts" : "Mask amounts"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={link} disabled={status !== "idle"}>
              Link another
            </Button>
            <Button type="button" size="sm" onClick={sync} disabled={status === "syncing" || status === "linking"}>
              {status === "syncing" ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Assessment assessment={assessment} currency={currency} masked={masked} />
        <ul className="space-y-2">
          {snapshot.accounts.map((account) => (
            <AccountRow key={account.id} account={account} masked={masked} />
          ))}
        </ul>
        {message ? (
          <p className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>{message}</p>
        ) : null}
        <TransactionTable transactions={snapshot.transactions} masked={masked} />
      </CardContent>
    </Card>
  )
}

function Assessment({
  assessment,
  currency,
  masked,
}: {
  assessment: CreditAssessment | null
  currency: string | null
  masked: boolean
}) {
  if (!assessment) {
    return <p className="text-sm text-muted-foreground">No credit read yet. Refresh after the bank finishes sending data.</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg bg-muted/60 p-3">
        <p className="text-xs text-muted-foreground">Credit read</p>
        <p className="mt-1 font-semibold">
          {assessment.score === null ? VERDICT_LABEL[assessment.verdict] : `${assessment.score} · ${VERDICT_LABEL[assessment.verdict]}`}
        </p>
      </div>
      <div className="rounded-lg bg-muted/60 p-3">
        <p className="text-xs text-muted-foreground">Typical month in</p>
        <p className="mt-1 font-semibold">{money(assessment.monthlyInflow, assessment.currency ?? currency, masked)}</p>
      </div>
      <div className="rounded-lg bg-muted/60 p-3">
        <p className="text-xs text-muted-foreground">Cash on hand</p>
        <p className="mt-1 font-semibold">{money(assessment.averageBalance, assessment.currency ?? currency, masked)}</p>
      </div>
      <ul className="space-y-1 sm:col-span-3">
        {assessment.reasons.map((reason) => (
          <li key={reason} className="text-sm text-muted-foreground">
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AccountRow({ account, masked }: { account: BankAccountView; masked: boolean }) {
  const name = account.displayName ?? account.subcategory
  const tail = account.last4 ? `···· ${masked ? "••••" : account.last4}` : ""
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
      <div>
        <p className="font-medium">
          {account.institutionName ?? "Bank"} · {name} {tail}
        </p>
        <p className="text-xs text-muted-foreground">
          {account.status}
          {account.transactionRefreshStatus === "pending" || account.balanceRefreshStatus === "pending"
            ? " · refresh in progress"
            : ""}
        </p>
      </div>
      <p className="font-medium">{money(account.availableBalance ?? account.currentBalance, account.currency, masked)}</p>
    </li>
  )
}

function TransactionTable({ transactions, masked }: { transactions: BankTransactionView[]; masked: boolean }) {
  if (!transactions.length) {
    return <p className="text-sm text-muted-foreground">No transactions stored yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            <th className="py-2 pr-3">Date</th>
            <th className="py-2 pr-3">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b last:border-0">
              <td className="py-2 pr-3 whitespace-nowrap">{new Date(transaction.transactedAt).toLocaleDateString()}</td>
              <td className="max-w-48 truncate py-2 pr-3">
                {masked ? "••••••" : transaction.description || transaction.status}
              </td>
              <td className={`py-2 text-right font-medium ${transaction.amount >= 0 ? "text-emerald-700" : "text-destructive"}`}>
                {money(Math.abs(transaction.amount), transaction.currency, masked)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
