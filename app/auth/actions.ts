"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_MESSAGES, authErrorMessage } from "@/lib/auth-errors"
import { safeNextPath } from "@/lib/auth-redirect"
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import {
  hasErrors,
  validateEmail,
  validateLoginForm,
  validateResetForm,
  validateSignupForm,
  type FieldErrors,
} from "@/lib/validation"

export type AuthFormState = {
  error?: string
  message?: string
  email?: string
  fieldErrors?: FieldErrors<"email" | "password" | "confirm">
}

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

async function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, "")
  const h = await headers()
  const origin = h.get("origin")
  if (origin) return origin
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  return host ? `${proto}://${host}` : "http://127.0.0.1:43123"
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = text(formData, "email").trim()
  const password = text(formData, "password")
  const fieldErrors = validateLoginForm({ email, password })
  if (hasErrors(fieldErrors)) return { fieldErrors, email }
  if (!isSupabaseConfigured()) return { error: SUPABASE_NOT_CONFIGURED, email }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: authErrorMessage(error), email }
  } catch (error) {
    return { error: authErrorMessage(error), email }
  }

  redirect(safeNextPath(text(formData, "next")))
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = text(formData, "email").trim()
  const password = text(formData, "password")
  const fieldErrors = validateSignupForm({ email, password })
  if (hasErrors(fieldErrors)) return { fieldErrors, email }
  if (!isSupabaseConfigured()) return { error: SUPABASE_NOT_CONFIGURED, email }

  let signedIn = false
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${await siteUrl()}/auth/callback?next=/onboarding`,
        data: { account_type: "creator" },
      },
    })
    if (error) return { error: authErrorMessage(error), email }
    // With email confirmation on, Supabase hides existing accounts by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      return { error: AUTH_MESSAGES.emailInUse, email }
    }
    signedIn = Boolean(data.session)
  } catch (error) {
    return { error: authErrorMessage(error), email }
  }

  if (signedIn) redirect("/onboarding")
  return {
    email,
    message: `Check ${email} for a confirmation link. Open it on this device to finish signing up.`,
  }
}

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = text(formData, "email").trim()
  const emailError = validateEmail(email)
  if (emailError) return { fieldErrors: { email: emailError }, email }
  if (!isSupabaseConfigured()) return { error: SUPABASE_NOT_CONFIGURED, email }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
    })
    if (error) return { error: authErrorMessage(error), email }
  } catch (error) {
    return { error: authErrorMessage(error), email }
  }

  return {
    email,
    message: `If an account exists for ${email}, a reset link is on its way. Open it on this device.`,
  }
}

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = text(formData, "password")
  const confirm = text(formData, "confirm")
  const fieldErrors = validateResetForm({ password, confirm })
  if (hasErrors(fieldErrors)) return { fieldErrors }
  if (!isSupabaseConfigured()) return { error: SUPABASE_NOT_CONFIGURED }

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      return { error: "Your reset link has expired. Request a new one from the login page." }
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: authErrorMessage(error) }
  } catch (error) {
    return { error: authErrorMessage(error) }
  }

  redirect("/dashboard")
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  redirect("/login")
}
