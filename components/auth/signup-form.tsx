"use client"

import { signup } from "@/app/auth/actions"
import { FormAlert } from "@/components/form-alert"
import { FormField } from "@/components/form-field"
import { SubmitButton } from "@/components/submit-button"
import { MIN_PASSWORD_LENGTH, validateSignupForm } from "@/lib/validation"
import { formText, useAuthForm } from "./use-auth-form"

export function SignupForm() {
  const { state, formAction, pending, onSubmit, errors, serverError } = useAuthForm(
    signup,
    (formData) =>
      validateSignupForm({
        email: formText(formData, "email"),
        password: formText(formData, "password"),
      })
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
      <FormField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters. Mix letters and numbers.`}
        error={errors.password}
      />
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create creator account
      </SubmitButton>
    </form>
  )
}
