import Link from "next/link"
import { ArrowLeft, Inbox } from "lucide-react"
import { AddIncomeForm } from "@/components/income/add-income-form"
import { IncomeList } from "@/components/income/income-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMonthKey } from "@/lib/dates"
import type { IncomeEntry } from "@/lib/income"
import { monthKeyOf } from "@/lib/income-stats"
import { formatKes } from "@/lib/money"

function groupByMonth(entries: IncomeEntry[]) {
  const groups = new Map<string, IncomeEntry[]>()
  for (const entry of entries) {
    const key = monthKeyOf(entry)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return [...groups.entries()]
}

const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties

/**
 * On large screens the add-income form is a fixed-width column that stays in view while the
 * history scrolls beside it, instead of one form stretched across the whole page.
 */
export function IncomeView({ entries, today }: { entries: IncomeEntry[]; today: string }) {
  const total = entries.reduce((sum, entry) => sum + entry.amountKes, 0)
  const groups = groupByMonth(entries)

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="rise" style={stagger(0)}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h1 className="font-heading text-4xl tracking-tight lg:text-[2.6rem]">All income</h1>
          {entries.length ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground tabular-nums">{formatKes(total)}</span> across{" "}
              {entries.length} {entries.length === 1 ? "payment" : "payments"}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(22rem,27rem)_minmax(0,1fr)] lg:gap-10 2xl:grid-cols-[28rem_minmax(0,1fr)]">
        <Card
          id="add"
          className="rise w-full max-w-xl scroll-mt-24 lg:sticky lg:top-8 lg:max-w-none"
          style={stagger(1)}
        >
          <CardHeader>
            <CardTitle className="text-xl">Add income</CardTitle>
          </CardHeader>
          <CardContent>
            <AddIncomeForm today={today} />
          </CardContent>
        </Card>

        <div className="space-y-6 lg:space-y-7">
          {groups.length ? (
            groups.map(([key, items], index) => (
              <section key={key} aria-labelledby={`month-${key}`} className="rise" style={stagger(index + 2)}>
                <Card>
                  <CardHeader>
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 id={`month-${key}`} className="font-heading text-xl">
                        {formatMonthKey(key)}
                      </h2>
                      <p className="text-sm text-muted-foreground tabular-nums">
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
            <div className="surface rise rounded-3xl px-6 py-20 text-center" style={stagger(2)}>
              <Inbox className="mx-auto size-8 text-primary" aria-hidden="true" />
              <h2 className="font-heading mt-4 text-2xl">No income logged yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Use the form to add your first payment. It will show up here and on your dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
