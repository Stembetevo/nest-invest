import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { FormAlert } from "@/components/form-alert"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Choose a new password — nest" }

async function hasRecoverySession() {
  if (!isSupabaseConfigured()) return false
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return Boolean(data.user)
  } catch {
    return false
  }
}

export default async function ResetPasswordPage() {
  const ready = await hasRecoverySession()

  return (
    <AuthCard
      eyebrow="Account help"
      title="Choose a new password"
      footer={
        <Link href="/login" className="font-medium text-primary">
          Back to log in
        </Link>
      }
    >
      {ready ? (
        <ResetPasswordForm />
      ) : (
        <div className="space-y-4">
          <FormAlert tone="error">
            This reset link has expired or was opened on a different device.
          </FormAlert>
          <Link href="/forgot-password" className="block text-sm font-medium text-primary">
            Send me a new link
          </Link>
        </div>
      )}
    </AuthCard>
  )
}
