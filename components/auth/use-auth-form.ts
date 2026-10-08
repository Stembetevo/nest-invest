"use client"

import { useActionState, useState, type FormEvent } from "react"
import type { AuthFormState } from "@/app/auth/actions"
import { hasErrors } from "@/lib/validation"

type FieldErrors = NonNullable<AuthFormState["fieldErrors"]>

/** Runs client validation before the server action and merges both sets of field errors. */
export function useAuthForm(
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>,
  validate: (formData: FormData) => FieldErrors
) {
  const [state, formAction, pending] = useActionState(action, {})
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const errors = validate(new FormData(event.currentTarget))
    if (!hasErrors(errors)) {
      setClientErrors(null)
      return
    }
    event.preventDefault()
    setClientErrors(errors)
    const firstInvalid = (Object.keys(errors) as (keyof FieldErrors)[]).find((key) => errors[key])
    event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
  }

  return {
    state,
    formAction,
    pending,
    onSubmit,
    errors: clientErrors ?? state.fieldErrors ?? {},
    serverError: clientErrors ? undefined : state.error,
  }
}

export function formText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}
