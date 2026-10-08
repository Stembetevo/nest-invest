import { FieldError, FormField } from "@/components/form-field"
import { Label } from "@/components/ui/label"
import { INCOME_SOURCES, type IncomeSource } from "@/lib/income"
import { MAX_NOTE_LENGTH } from "@/lib/validation"

export type IncomeEntryErrors = Partial<Record<"amount" | "source" | "receivedOn" | "note", string>>

export function IncomeEntryFields({
  today,
  errors,
  defaultSource,
}: {
  today: string
  errors: IncomeEntryErrors
  defaultSource?: IncomeSource
}) {
  return (
    <div className="space-y-4">
      <FormField
        id="amount"
        name="amount"
        label="Amount (KSh)"
        inputMode="decimal"
        autoComplete="off"
        placeholder="e.g. 15,000"
        error={errors.amount}
      />
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <select
          id="source"
          name="source"
          defaultValue={defaultSource ?? ""}
          aria-invalid={errors.source ? true : undefined}
          aria-describedby={errors.source ? "source-error" : undefined}
          className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm"
        >
          <option value="" disabled>
            Choose a source
          </option>
          {INCOME_SOURCES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
        <FieldError id="source-error" message={errors.source} />
      </div>
      <FormField
        id="receivedOn"
        name="receivedOn"
        type="date"
        label="Date received"
        max={today}
        defaultValue={today}
        error={errors.receivedOn}
      />
      <FormField
        id="note"
        name="note"
        label="Note (optional)"
        maxLength={MAX_NOTE_LENGTH}
        placeholder="e.g. Safaricom campaign"
        error={errors.note}
      />
    </div>
  )
}
