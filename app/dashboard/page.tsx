import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ComingSoonCard } from "@/components/dashboard/coming-soon-card"
import { IncomeChart } from "@/components/dashboard/income-chart"
import { ManikkaCard } from "@/components/dashboard/manikka-card"
import { MonthSummaryCard } from "@/components/dashboard/month-summary-card"
import { ProfileProgressCard } from "@/components/dashboard/profile-progress-card"
import { RecentIncome } from "@/components/dashboard/recent-income"
import { Button } from "@/components/ui/button"
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

export const metadata: Metadata = { title: "Your income — nest" }

export default async function DashboardPage() {
  const { supabase, user } = await requireUser("/dashboard")
  const [profile, sources, entries] = await Promise.all([
    fetchProfile(supabase, user.id),
    fetchSources(supabase),
    fetchEntries(supabase),
  ])
  if (!profile) throw new Error("Profile missing")

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

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            Creator income
          </p>
          <h1 className="font-heading mt-1 text-3xl tracking-tight">
            Habari{profile.displayName ? `, ${profile.displayName}` : ""}
          </h1>
        </div>
        <Button asChild size="lg" variant="outline" className="h-10">
          <Link href="/income#add">
            <Plus aria-hidden="true" />
            Add income
          </Link>
        </Button>
      </div>

      <MonthSummaryCard monthKey={thisMonth} change={change} />
      <IncomeChart months={months} sources={bySource} />

      <div className="grid gap-4 sm:grid-cols-2">
        <ManikkaCard insight={manikkaInsight(entries, now)} />
        <ProfileProgressCard
          steps={verifiedProfileSteps({ profile, sourceCount: sources.length, entries })}
        />
      </div>

      <RecentIncome entries={entries.slice(0, 5)} />
      <ComingSoonCard />
    </div>
  )
}
