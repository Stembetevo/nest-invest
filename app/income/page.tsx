import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Inbox } from "lucide-react"
import { AddIncomeForm } from "@/components/income/add-income-form"
import { IncomeList } from "@/components/income/income-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEntries, requireUser } from "@/lib/creator-data"
import { formatMonthKey, nairobiTodayIso } from "@/lib/dates"
import type { IncomeEntry } from "@/lib/income"
import { monthKeyOf } from "@/lib/income-stats"
import { formatKes } from "@/lib/money"

export const metadata: Metadata = { title: "All income — nest" }

function groupByMonth(entries: IncomeEntry[]) {
  const groups = new Map<string, IncomeEntry[]>()
  for (const entry of entries) {
    const key = monthKeyOf(entry)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return [...groups.entries()]
}

export default async function IncomePage() {
  const { supabase } = await requireUser("/income")
  const entries = await fetchEntries(supabase)

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dashboard
        </Link>
        <h1 className="font-heading mt-2 text-3xl tracking-tight">All income</h1>
      </div>

      <Card id="add" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-lg">Add income</CardTitle>
        </CardHeader>
        <CardContent>
          <AddIncomeForm today={nairobiTodayIso()} />
        </CardContent>
      </Card>

      {entries.length ? (
        groupByMonth(entries).map(([key, items]) => (
          <section key={key} aria-labelledby={`month-${key}`}>
            <Card>
              <CardHeader>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id={`month-${key}`} className="font-heading text-lg">
                    {formatMonthKey(key)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatKes(items.reduce((sum, item) => sum + item.amountKes, 0))}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <IncomeList entries={items} />
              </CardContent>
            </Card>
          </section>
        ))
      ) : (
        <div className="rounded-3xl bg-card px-5 py-10 text-center ring-1 ring-foreground/10">
          <Inbox className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="font-heading mt-4 text-2xl">No income logged yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Use the form above to add your first payment. It will show up here and on your
            dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
