import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = { title: "Reset your password — nest" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account help"
      title="Forgot your password?"
      description="Enter your email and we’ll send you a link to choose a new one."
      footer={
        <Link href="/login" className="font-medium text-primary">
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
