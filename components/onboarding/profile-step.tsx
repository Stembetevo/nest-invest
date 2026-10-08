"use client"

import { saveProfileStep, type OnboardingFormState } from "@/app/onboarding/actions"
import { ChoiceChip } from "@/components/choice-chip"
import { FormAlert } from "@/components/form-alert"
import { FieldError, FormField } from "@/components/form-field"
import { SubmitButton } from "@/components/submit-button"
import { formText, useValidatedAction } from "@/components/use-validated-action"
import { CREATOR_TYPES, type CreatorType } from "@/lib/income"
import { parseProfileStep } from "@/lib/validation"

export type ProfileValues = { displayName: string; creatorType: CreatorType | null }

export function ProfileStep({
  initial,
  onDone,
}: {
  initial: ProfileValues
  onDone: (values: ProfileValues) => void
}) {
  const { formAction, pending, onSubmit, errors, serverError } = useValidatedAction(
    async (prev: OnboardingFormState, formData: FormData) => {
      const result = await saveProfileStep(prev, formData)
      if (result.ok) {
        onDone({
          displayName: formText(formData, "displayName").trim(),
          creatorType: formText(formData, "creatorType") as CreatorType,
        })
      }
      return result
    },
    {},
    (formData) => {
      const parsed = parseProfileStep({
        displayName: formText(formData, "displayName"),
        creatorType: formText(formData, "creatorType"),
      })
      return parsed.ok ? {} : parsed.errors
    }
  )

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-5">
      {serverError ? <FormAlert tone="error">{serverError}</FormAlert> : null}
      <FormField
        id="displayName"
        name="displayName"
        label="What should we call you?"
        autoComplete="name"
        defaultValue={initial.displayName}
        error={errors.displayName}
      />
      <fieldset
        className="space-y-3"
        aria-describedby={errors.creatorType ? "creatorType-error" : undefined}
      >
        <legend className="text-sm font-medium">What kind of creator are you?</legend>
        <div className="flex flex-wrap gap-2">
          {CREATOR_TYPES.map((type) => (
            <ChoiceChip
              key={type.value}
              type="radio"
              name="creatorType"
              value={type.value}
              label={type.label}
              defaultChecked={initial.creatorType === type.value}
            />
          ))}
        </div>
        <FieldError id="creatorType-error" message={errors.creatorType} />
      </fieldset>
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Continue
      </SubmitButton>
    </form>
  )
}
