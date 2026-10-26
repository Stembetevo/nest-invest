import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { formatMonthKey } from "@/lib/dates"
import { describeMonthChange, type MonthChange } from "@/lib/income-stats"
import { formatKes } from "@/lib/money"
import { cn } from "@/lib/utils"

const ICONS = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }

export function MonthSummaryCard({ monthKey, change }: { monthKey: string; change: MonthChange }) {
  const Icon = ICONS[change.direction]
  const empty = change.current === 0 && change.previous === 0

  return (
    <section
      aria-labelledby="month-total-heading"
      className="hero-panel rounded-3xl px-5 py-6 text-primary-foreground sm:px-7"
    >
      <h2
        id="month-total-heading"
        className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--gold)]"
      >
        Earned in {formatMonthKey(monthKey)}
      </h2>
      <p className="font-heading mt-2 text-4xl tracking-tight sm:text-5xl">
        {formatKes(change.current)}
      </p>
      <p
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm",
          empty ? "bg-primary-foreground/10 text-primary-foreground/80" : "bg-primary-foreground/15"
        )}
      >
        {empty ? null : (
          <Icon
            className={cn("size-4", change.direction === "up" && "text-[var(--gold)]")}
            aria-hidden="true"
          />
        )}
        {describeMonthChange(change)}
      </p>
    </section>
  )
}
