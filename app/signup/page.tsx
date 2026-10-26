import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Sign up — nest" }

export default function SignupPage() {
  return (
    <AuthCard
      eyebrow="Creator income"
      title="Track every shilling you earn"
      description="Brand deals, YouTube, M-Pesa, clients — one place, in KSh."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  )
}
