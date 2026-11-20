import type { Metadata } from "next"
import { redirect } from "next/navigation"
<<<<<<< HEAD
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { fetchEntries, fetchProfile, fetchSources, requireUser } from "@/lib/creator-data"
import {
  currentMonthKey,
  incomeByMonth,
  incomeBySource,
  manikkaInsight,
  monthOverMonth,
  shiftMonthKey,
  totalForMonth,
  verifiedProfileSteps,
} from "@/lib/income-stats"
=======
import { BankAccountsCard } from "@/components/dashboard/bank-accounts-card"
import { ComingSoonCard } from "@/components/dashboard/coming-soon-card"
import { ProfileProgressCard } from "@/components/dashboard/profile-progress-card"
import { StripeIncomeCard } from "@/components/dashboard/stripe-income-card"
import { fetchProfile, requireUser } from "@/lib/creator-data"
import { verifiedProfileSteps } from "@/lib/income-stats"
import { loadBankSnapshot } from "@/lib/financial-connections"
>>>>>>> 60312ee4137d9795bcbd5d6d2105e910b070e91f
import { resolveOnboardingStep } from "@/lib/onboarding"
import { stripeConnectionStatus } from "@/lib/stripe-data"

export const metadata: Metadata = { title: "Your income — Manikka" }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe_error?: string | string[] }>
}) {
  const params = await searchParams
  const stripeError = Array.isArray(params.stripe_error) ? params.stripe_error[0] : params.stripe_error
  const { supabase, user } = await requireUser("/dashboard")
  const [profile, stripe, bank] = await Promise.all([
    fetchProfile(supabase, user.id),
    stripeConnectionStatus(user.id),
    loadBankSnapshot(user.id),
  ])
  if (!profile) throw new Error("Profile missing")
  if (resolveOnboardingStep(profile) !== "complete") redirect("/onboarding")

  const steps = verifiedProfileSteps({ profile, sourceCount: sources.length, entries })
  const average = months.reduce((sum, month) => sum + month.total, 0) / Math.max(months.length, 1)
  const hour = Number(new Intl.DateTimeFormat("en-KE", { hour: "numeric", hour12: false, timeZone: "Africa/Nairobi" }).format(now)) % 24
  const greeting = hour < 12 ? "Habari za asubuhi" : hour < 17 ? "Habari za mchana" : "Habari za jioni"
  const subline =
    entries.length === 0
      ? "Nothing logged yet. Add your first payment and we will take it from there."
      : "Here is how your money is moving. Keep adding what comes in, and your report gets stronger."

  return (
<<<<<<< HEAD
    <DashboardView
      today={now.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
      greeting={greeting}
      displayName={profile.displayName}
      subline={subline}
      monthKey={thisMonth}
      change={change}
      average={average}
      sourceCount={sources.length}
      steps={steps}
      months={months}
      bySource={bySource}
      recent={entries.slice(0, 4)}
      insight={manikkaInsight(entries, now)}
      stripe={stripe.connected ? { connected: true, accountId: stripe.accountId } : { connected: false }}
    />
=======
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
        initialError={stripeError}
        setupMessage={stripe.setupMessage}
      />
      <ComingSoonCard />
    </div>
>>>>>>> 60312ee4137d9795bcbd5d6d2105e910b070e91f
  )
}
