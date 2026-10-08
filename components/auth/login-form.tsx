"use client"

import Link from "next/link"
import { login } from "@/app/auth/actions"
import { FormAlert } from "@/components/form-alert"
import { FormField } from "@/components/form-field"
import { SubmitButton } from "@/components/submit-button"
import { validateLoginForm } from "@/lib/validation"
import { formText, useAuthForm } from "./use-auth-form"

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const { state, formAction, pending, onSubmit, errors, serverError } = useAuthForm(
    login,
    (formData) =>
      validateLoginForm({
        email: formText(formData, "email"),
        password: formText(formData, "password"),
      })
  )

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-4">
      {notice && !serverError ? <FormAlert tone="error">{notice}</FormAlert> : null}
      {serverError ? <FormAlert tone="error">{serverError}</FormAlert> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
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
        autoComplete="current-password"
        error={errors.password}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-primary">
          Forgot password?
        </Link>
      </div>
      <SubmitButton pending={pending} pendingLabel="Signing in…">
        Log in
      </SubmitButton>
    </form>
  )
}
