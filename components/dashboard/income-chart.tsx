"use client"

import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatMonthKey } from "@/lib/dates"
import { incomeSourceLabel } from "@/lib/income"
import type { MonthTotal, SourceTotal } from "@/lib/income-stats"
import { formatKes } from "@/lib/money"

export function IncomeChart({ months, sources, className }: { months: MonthTotal[]; sources: SourceTotal[]; className?: string }) {
  const hasData = months.some((month) => month.total > 0)

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Your income</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 px-6 py-12 text-center">
            <BarChart3 className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No income in the last 6 months</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your monthly and per-source charts fill in as you add income.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="month" className={className}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">Your income</CardTitle>
            <TabsList aria-label="Chart view">
              <TabsTrigger value="month" className="px-3">
                By month
              </TabsTrigger>
              <TabsTrigger value="source" className="px-3">
                By source
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-end">
          <TabsContent value="month">
            <MonthBars months={months} />
          </TabsContent>
          <TabsContent value="source">
            <SourceBars sources={sources} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  )
}

function MonthBars({ months }: { months: MonthTotal[] }) {
  const max = Math.max(...months.map((month) => month.total), 1)
  return (
    <ul aria-label="Income by month, last 6 months" className="flex h-[clamp(7rem,15vh,14rem)] items-end gap-3 sm:gap-5">
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
                className={current ? "grow-y w-full rounded-t-xl bg-[var(--chart-2)]" : "grow-y w-full rounded-t-xl bg-[var(--chart-1)]"}
                style={{ height: `${height}%`, "--i": index } as React.CSSProperties}
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
      <ul aria-label="Income by source, last 6 months" className="space-y-4 pt-2">
        {sources.map((item, index) => (
          <li key={item.source} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{incomeSourceLabel(item.source)}</span>
              <span className="text-muted-foreground">{formatKes(item.total)}</span>
            </div>
            <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="grow-x h-full rounded-full bg-[var(--chart-1)]"
                style={{ width: `${Math.max((item.total / max) * 100, 2)}%`, "--i": index } as React.CSSProperties}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
