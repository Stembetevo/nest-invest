import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { formatMonthKey } from "@/lib/dates"
import { describeMonthChange, type MonthChange } from "@/lib/income-stats"
import { formatKes } from "@/lib/money"
import { cn } from "@/lib/utils"

const ICONS = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }

export function KpiRow({
  monthKey,
  change,
  average,
  sourceCount,
  stepsDone,
  stepsTotal,
}: {
  monthKey: string
  change: MonthChange
  average: number
  sourceCount: number
  stepsDone: number
  stepsTotal: number
}) {
  const Icon = ICONS[change.direction]
  const empty = change.current === 0 && change.previous === 0
  const ready = Math.round((stepsDone / stepsTotal) * 100)

  return (
    <section aria-label="Key figures" className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-6">
      <div className="hero-panel col-span-2 rounded-3xl p-6 lg:col-span-1 lg:p-6">
        <h2 className="text-sm text-muted-foreground">Earned in {formatMonthKey(monthKey)}</h2>
        <p className="font-heading mt-2 text-3xl tracking-tight">{formatKes(change.current)}</p>
        <p className={cn("mt-2 inline-flex items-center gap-1 text-sm", change.direction === "up" && !empty ? "text-[var(--gold)]" : "text-muted-foreground")}>
          {empty ? null : <Icon className="size-4" aria-hidden="true" />}
          {describeMonthChange(change)}
        </p>
      </div>
      <Stat label="6-month average" value={formatKes(Math.round(average))} note="per month" />
      <Stat label="Income sources" value={String(sourceCount)} note={sourceCount === 1 ? "source connected" : "sources connected"} />
      <Stat label="Report readiness" value={`${ready}%`} note={`${stepsDone} of ${stepsTotal} steps`} />
    </section>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="surface lift rounded-3xl p-6 lg:p-6">
      <h2 className="text-sm text-muted-foreground">{label}</h2>
      <p className="font-heading mt-2 text-2xl tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  )
}
