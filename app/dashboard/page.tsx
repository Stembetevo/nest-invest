import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { BankAccountsCard } from "@/components/dashboard/bank-accounts-card"
import { ComingSoonCard } from "@/components/dashboard/coming-soon-card"
import { ProfileProgressCard } from "@/components/dashboard/profile-progress-card"
import { StripeIncomeCard } from "@/components/dashboard/stripe-income-card"
import { fetchProfile, requireUser } from "@/lib/creator-data"
import { verifiedProfileSteps } from "@/lib/income-stats"
import { loadBankSnapshot } from "@/lib/financial-connections"
import { resolveOnboardingStep } from "@/lib/onboarding"
import { stripeConnectionStatus } from "@/lib/stripe-data"

export const metadata: Metadata = { title: "Your income — Manikka" }

export default async function DashboardPage() {
  const { supabase, user } = await requireUser("/dashboard")
  const [profile, stripe, bank] = await Promise.all([
    fetchProfile(supabase, user.id),
    stripeConnectionStatus(user.id),
    loadBankSnapshot(user.id),
  ])
  if (!profile) throw new Error("Profile missing")
  if (resolveOnboardingStep(profile) !== "complete") redirect("/onboarding")

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          Your income
        </p>
        <h1 className="font-heading mt-1 text-3xl tracking-tight">
          Habari{profile.displayName ? `, ${profile.displayName}` : ""}
        </h1>
      </div>

      <ProfileProgressCard steps={verifiedProfileSteps(profile)} />
      <BankAccountsCard initial={bank} />
      <StripeIncomeCard
        connected={stripe.connected}
        accountId={stripe.connected ? stripe.accountId : undefined}
        setupMessage={stripe.setupMessage}
      />
      <ComingSoonCard />
    </div>
  )
}
