"use client"

import { signup } from "@/app/auth/actions"
import { GoogleButton } from "@/components/auth/google-button"
import { FormAlert } from "@/components/form-alert"
import { FormField } from "@/components/form-field"
import { PasswordField } from "@/components/auth/password-field"
import { SubmitButton } from "@/components/submit-button"
import { MIN_PASSWORD_LENGTH, validateSignupForm } from "@/lib/validation"
import { formText, useValidatedAction } from "@/components/use-validated-action"

export function SignupForm({ notice }: { notice?: string }) {
  const { state, formAction, pending, onSubmit, errors, serverError } = useValidatedAction(
    signup,
    {},
    (formData) =>
      validateSignupForm({
        email: formText(formData, "email"),
        password: formText(formData, "password"),
      })
  )

  if (state.message) return <FormAlert tone="success">{state.message}</FormAlert>

  return (
    <div className="space-y-4">
      <GoogleButton next="/onboarding" />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-4">
      {notice && !serverError ? <FormAlert tone="error">{notice}</FormAlert> : null}
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
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        showStrength
        hint={`At least ${MIN_PASSWORD_LENGTH} characters. Mix letters and numbers.`}
        error={errors.password}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        By creating an account you agree to our terms and privacy policy.
      </p>
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create free account
      </SubmitButton>
      </form>
    </div>
  )
}
