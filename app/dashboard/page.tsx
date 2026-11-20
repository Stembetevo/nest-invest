import type { Metadata } from "next"
import { redirect } from "next/navigation"
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
import { resolveOnboardingStep } from "@/lib/onboarding"
import { stripeConnectionStatus } from "@/lib/stripe-data"

export const metadata: Metadata = { title: "Your income — Manikka" }

export default async function DashboardPage() {
  const { supabase, user } = await requireUser("/dashboard")
  const [profile, sources, entries, stripe] = await Promise.all([
    fetchProfile(supabase, user.id),
    fetchSources(supabase),
    fetchEntries(supabase),
    stripeConnectionStatus(user.id),
  ])
  if (!profile) throw new Error("Profile missing")
  if (resolveOnboardingStep(profile, sources.length) !== "complete") redirect("/onboarding")

  const now = new Date()
  const thisMonth = currentMonthKey(now)
  const change = monthOverMonth(
    totalForMonth(entries, thisMonth),
    totalForMonth(entries, shiftMonthKey(thisMonth, -1))
  )
  const months = incomeByMonth(entries, now)
  const bySource = incomeBySource(
    entries,
    months.map((month) => month.key)
  )

  const steps = verifiedProfileSteps({ profile, sourceCount: sources.length, entries })
  const average = months.reduce((sum, month) => sum + month.total, 0) / Math.max(months.length, 1)
  const hour = Number(new Intl.DateTimeFormat("en-KE", { hour: "numeric", hour12: false, timeZone: "Africa/Nairobi" }).format(now)) % 24
  const greeting = hour < 12 ? "Habari za asubuhi" : hour < 17 ? "Habari za mchana" : "Habari za jioni"
  const subline =
    entries.length === 0
      ? "Nothing logged yet. Add your first payment and we will take it from there."
      : "Here is how your money is moving. Keep adding what comes in, and your report gets stronger."

  return (
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
  )
}
