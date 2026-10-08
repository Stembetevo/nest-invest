"use client"

import { startTransition, useActionState, useState, type FormEvent } from "react"
import { hasErrors } from "@/lib/validation"

type Errors = Partial<Record<string, string>>

export type ActionState = {
  error?: string
  fieldErrors?: Errors
}

/**
 * Wraps a server action with the same client-side validation the server runs, so obvious
 * mistakes show instantly and the first invalid field receives focus.
 */
export function useValidatedAction<S extends ActionState, E extends Errors>(
  action: (prev: Awaited<S>, formData: FormData) => Promise<S>,
  initialState: Awaited<S>,
  validate: (formData: FormData) => E
) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [clientErrors, setClientErrors] = useState<E | null>(null)

  // Dispatching manually (instead of letting the form action run) keeps typed values in place
  // when the server returns an error; React resets uncontrolled fields after form actions.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const formData = new FormData(event.currentTarget, submitter)
    const errors = validate(formData)
    if (!hasErrors(errors)) {
      setClientErrors(null)
      startTransition(() => formAction(formData))
      return
    }
    setClientErrors(errors)
    const firstInvalid = Object.keys(errors).find((key) => errors[key])
    event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
  }

  return {
    state,
    formAction,
    pending,
    onSubmit,
    errors: (clientErrors ?? state.fieldErrors ?? {}) as E,
    serverError: clientErrors ? undefined : state.error,
  }
}

export function formText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}
