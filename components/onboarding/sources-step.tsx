"use client"

import { saveSourcesStep, type OnboardingFormState } from "@/app/onboarding/actions"
import { ChoiceChip } from "@/components/choice-chip"
import { FormAlert } from "@/components/form-alert"
import { FieldError } from "@/components/form-field"
import { SubmitButton } from "@/components/submit-button"
import { Button } from "@/components/ui/button"
import { useValidatedAction } from "@/components/use-validated-action"
import { INCOME_SOURCES, type IncomeSource } from "@/lib/income"
import { parseSourcesStep } from "@/lib/validation"

export function SourcesStep({
  initial,
  onBack,
  onDone,
}: {
  initial: IncomeSource[]
  onBack: () => void
  onDone: (sources: IncomeSource[]) => void
}) {
  const { formAction, pending, onSubmit, errors, serverError } = useValidatedAction(
    async (prev: OnboardingFormState, formData: FormData) => {
      const result = await saveSourcesStep(prev, formData)
      if (result.ok) onDone(formData.getAll("sources").map(String) as IncomeSource[])
      return result
    },
    {},
    (formData): { sources?: string } => {
      const parsed = parseSourcesStep(formData.getAll("sources").map(String))
      return parsed.ok ? {} : { sources: parsed.error }
    }
  )

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-5">
      {serverError ? <FormAlert tone="error">{serverError}</FormAlert> : null}
      <fieldset className="space-y-3" aria-describedby="sources-hint sources-error">
        <legend className="text-sm font-medium">Where do you get paid?</legend>
        <p id="sources-hint" className="text-sm text-muted-foreground">
          Pick all that apply. You can change these later.
        </p>
        <div className="flex flex-wrap gap-2">
          {INCOME_SOURCES.map((source, index) => (
            <ChoiceChip
              key={source.value}
              type="checkbox"
              name="sources"
              value={source.value}
              label={source.label}
              defaultChecked={initial.includes(source.value)}
              aria-invalid={errors.sources && index === 0 ? true : undefined}
            />
          ))}
        </div>
        <FieldError id="sources-error" message={errors.sources} />
      </fieldset>
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="h-11 px-5" onClick={onBack}>
          Back
        </Button>
        <SubmitButton pending={pending} pendingLabel="Saving…" className="flex-1">
          Continue
        </SubmitButton>
      </div>
    </form>
  )
}
