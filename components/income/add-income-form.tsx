"use client"

import { useRef } from "react"
import { toast } from "sonner"
import { addIncomeEntry, type AddIncomeState } from "@/app/income/actions"
import { FormAlert } from "@/components/form-alert"
import { SubmitButton } from "@/components/submit-button"
import { formText, useValidatedAction } from "@/components/use-validated-action"
import { parseIncomeEntry } from "@/lib/validation"
import { IncomeEntryFields, type IncomeEntryErrors } from "./income-entry-fields"

export function AddIncomeForm({ today }: { today: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const { formAction, pending, onSubmit, errors, serverError } = useValidatedAction(
    async (prev: AddIncomeState, formData: FormData) => {
      const result = await addIncomeEntry(prev, formData)
      if (result.ok) {
        formRef.current?.reset()
        toast.success("Income saved.")
      }
      return result
    },
    {},
    (formData): IncomeEntryErrors => {
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
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="space-y-4">
      {serverError ? <FormAlert tone="error">{serverError}</FormAlert> : null}
      <IncomeEntryFields today={today} errors={errors} />
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save income
      </SubmitButton>
    </form>
  )
}
