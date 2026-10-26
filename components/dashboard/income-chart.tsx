"use client"

import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatMonthKey } from "@/lib/dates"
import { incomeSourceLabel } from "@/lib/income"
import type { MonthTotal, SourceTotal } from "@/lib/income-stats"
import { formatKes } from "@/lib/money"

export function IncomeChart({ months, sources }: { months: MonthTotal[]; sources: SourceTotal[] }) {
  const hasData = months.some((month) => month.total > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your income</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <Tabs defaultValue="month">
            <TabsList aria-label="Chart view">
              <TabsTrigger value="month" className="px-3">
                By month
              </TabsTrigger>
              <TabsTrigger value="source" className="px-3">
                By source
              </TabsTrigger>
            </TabsList>
            <TabsContent value="month" className="pt-4">
              <MonthBars months={months} />
            </TabsContent>
            <TabsContent value="source" className="pt-4">
              <SourceBars sources={sources} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/60 px-4 py-8 text-center">
            <BarChart3 className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No income in the last 6 months</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your monthly and per-source charts fill in as you add income.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MonthBars({ months }: { months: MonthTotal[] }) {
  const max = Math.max(...months.map((month) => month.total), 1)
  return (
    <ul aria-label="Income by month, last 6 months" className="flex h-44 items-end gap-2">
      {months.map((month, index) => {
        const height = month.total > 0 ? Math.max((month.total / max) * 100, 4) : 0
        const current = index === months.length - 1
        return (
          <li key={month.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="sr-only">
              {formatMonthKey(month.key)}: {formatKes(month.total)}
            </span>
            <div aria-hidden="true" className="flex w-full flex-1 items-end">
              <div
                className={current ? "w-full rounded-t-md bg-[var(--chart-2)]" : "w-full rounded-t-md bg-[var(--chart-1)]"}
                style={{ height: `${height}%` }}
                title={formatKes(month.total)}
              />
            </div>
            <span aria-hidden="true" className="text-[11px] text-muted-foreground">
              {formatMonthKey(month.key, true)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function SourceBars({ sources }: { sources: SourceTotal[] }) {
  const max = Math.max(...sources.map((item) => item.total), 1)
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Last 6 months</p>
      <ul aria-label="Income by source, last 6 months" className="space-y-3 pt-1">
        {sources.map((item) => (
          <li key={item.source} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{incomeSourceLabel(item.source)}</span>
              <span className="text-muted-foreground">{formatKes(item.total)}</span>
            </div>
            <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--chart-1)]"
                style={{ width: `${Math.max((item.total / max) * 100, 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
