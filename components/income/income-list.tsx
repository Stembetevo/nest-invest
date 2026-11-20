import { formatDateOnly } from "@/lib/dates"
import { incomeSourceLabel, type IncomeEntry } from "@/lib/income"
import { formatKes } from "@/lib/money"
import { cn } from "@/lib/utils"

export function IncomeList({
  entries,
  tallOnlyFrom,
}: {
  entries: IncomeEntry[]
  /** Rows from this index on are hidden on short viewports so dashboards still fit one screen. */
  tallOnlyFrom?: number
}) {
  return (
    <ul className="divide-y divide-border">
      {entries.map((entry, index) => (
        <li
          key={entry.id}
          className={cn(
            "flex items-start justify-between gap-3 py-3",
            tallOnlyFrom !== undefined && index >= tallOnlyFrom && "[@media(max-height:1100px)]:hidden"
          )}
        >
          <div className="min-w-0">
            <p className="text-[0.95rem] font-medium">{incomeSourceLabel(entry.source)}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateOnly(entry.receivedOn)}
              {entry.note ? <span className="break-words"> · {entry.note}</span> : null}
            </p>
          </div>
          <p className="shrink-0 font-medium tabular-nums">{formatKes(entry.amountKes)}</p>
        </li>
      ))}
    </ul>
  )
}
