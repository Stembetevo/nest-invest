import { formatDateOnly } from "@/lib/dates"
import { incomeSourceLabel, type IncomeEntry } from "@/lib/income"
import { formatKes } from "@/lib/money"

export function IncomeList({ entries }: { entries: IncomeEntry[] }) {
  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="font-medium">{incomeSourceLabel(entry.source)}</p>
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
