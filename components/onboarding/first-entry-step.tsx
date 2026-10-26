"use client"

import { Loader2 } from "lucide-react"
import { finishOnboarding } from "@/app/onboarding/actions"
import { FormAlert } from "@/components/form-alert"
import { IncomeEntryFields, type IncomeEntryErrors } from "@/components/income/income-entry-fields"
import { SubmitButton } from "@/components/submit-button"
import { Button } from "@/components/ui/button"
import { formText, useValidatedAction } from "@/components/use-validated-action"
import type { IncomeSource } from "@/lib/income"
import { parseIncomeEntry } from "@/lib/validation"

export function FirstEntryStep({
  today,
  sources,
  onBack,
}: {
  today: string
  sources: IncomeSource[]
  onBack: () => void
}) {
  const { formAction, pending, onSubmit, errors, serverError } = useValidatedAction(
    finishOnboarding,
    {},
    (formData): IncomeEntryErrors => {
      if (formText(formData, "intent") === "skip") return {}
      const parsed = parseIncomeEntry(
        {
          amount: formText(formData, "amount"),
          source: formText(formData, "source"),
          receivedOn: formText(formData, "receivedOn"),
          note: formText(formData, "note"),
        },
        today
      )
      return parsed.ok ? {} : parsed.errors
    }
  )

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-5">
      {serverError ? <FormAlert tone="error">{serverError}</FormAlert> : null}
      <p className="text-sm text-muted-foreground">
        Add one payment you received recently. Amounts are in Kenyan shillings.
      </p>
      <IncomeEntryFields
        today={today}
        errors={errors}
        defaultSource={sources.length === 1 ? sources[0] : undefined}
      />
      <SubmitButton pending={pending} pendingLabel="Saving…" name="intent" value="save">
        Save and finish
      </SubmitButton>
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="h-11 px-5" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          name="intent"
          value="skip"
          variant="ghost"
          size="lg"
          className="h-11 flex-1"
          disabled={pending}
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Skip for now
        </Button>
      </div>
    </form>
  )
}
