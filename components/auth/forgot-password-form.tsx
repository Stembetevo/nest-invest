"use client"

import { requestPasswordReset } from "@/app/auth/actions"
import { FormAlert } from "@/components/form-alert"
import { FormField } from "@/components/form-field"
import { SubmitButton } from "@/components/submit-button"
import { validateEmail } from "@/lib/validation"
import { formText, useAuthForm } from "./use-auth-form"

export function ForgotPasswordForm() {
  const { state, formAction, pending, onSubmit, errors, serverError } = useAuthForm(
    requestPasswordReset,
    (formData) => ({ email: validateEmail(formText(formData, "email")) })
  )

  if (state.message) return <FormAlert tone="success">{state.message}</FormAlert>

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-4">
      {serverError ? <FormAlert tone="error">{serverError}</FormAlert> : null}
      <FormField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        defaultValue={state.email}
        error={errors.email}
      />
      <SubmitButton pending={pending} pendingLabel="Sending link…">
        Send reset link
      </SubmitButton>
    </form>
  )
}
