import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Sign up — Manikka" }

export default function SignupPage() {
  return (
    <AuthCard
      eyebrow="Creator income"
      title="Create your free account"
      description="Track your income and build a report lenders can trust."
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
