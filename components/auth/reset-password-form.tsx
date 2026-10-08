"use client"

import { resetPassword } from "@/app/auth/actions"
import { FormAlert } from "@/components/form-alert"
import { FormField } from "@/components/form-field"
import { SubmitButton } from "@/components/submit-button"
import { MIN_PASSWORD_LENGTH, validateResetForm } from "@/lib/validation"
import { formText, useAuthForm } from "./use-auth-form"

export function ResetPasswordForm() {
  const { formAction, pending, onSubmit, errors, serverError } = useAuthForm(
    resetPassword,
    (formData) =>
      validateResetForm({
        password: formText(formData, "password"),
        confirm: formText(formData, "confirm"),
      })
  )

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-4">
      {serverError ? <FormAlert tone="error">{serverError}</FormAlert> : null}
      <FormField
        id="password"
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={errors.password}
      />
      <FormField
        id="confirm"
        name="confirm"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirm}
      />
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save new password
      </SubmitButton>
    </form>
  )
}
