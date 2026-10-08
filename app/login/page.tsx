import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { safeNextPath } from "@/lib/auth-redirect"

export const metadata: Metadata = { title: "Log in — nest" }

const NOTICES: Record<string, string> = {
  link: "That link has expired or was already used. Request a new one below.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const nextPath = next ? safeNextPath(next) : undefined

  return (
    <AuthCard
      eyebrow="Creator income"
      title="Welcome back"
      description="Log in to see what you earned this month."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={nextPath} notice={error ? NOTICES[error] : undefined} />
    </AuthCard>
  )
}
