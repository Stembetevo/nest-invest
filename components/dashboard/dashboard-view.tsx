import Link from "next/link"
import { Plus } from "lucide-react"
import { ComingSoonCard } from "@/components/dashboard/coming-soon-card"
import { IncomeChart } from "@/components/dashboard/income-chart"
import { KpiRow } from "@/components/dashboard/kpi-row"
import { ManikkaCard } from "@/components/dashboard/manikka-card"
import { ProfileProgressCard } from "@/components/dashboard/profile-progress-card"
import { RecentIncome } from "@/components/dashboard/recent-income"
import { StripeIncomeCard } from "@/components/dashboard/stripe-income-card"
import { Button } from "@/components/ui/button"
import type { IncomeEntry } from "@/lib/income"
import type { MonthChange, MonthTotal, ProfileStepStatus, SourceTotal } from "@/lib/income-stats"

export type DashboardViewProps = {
  today: string
  greeting: string
  displayName?: string | null
  subline: string
  monthKey: string
  change: MonthChange
  average: number
  sourceCount: number
  steps: ProfileStepStatus[]
  months: MonthTotal[]
  bySource: SourceTotal[]
  recent: IncomeEntry[]
  insight: string
  stripe: { connected: boolean; accountId?: string }
}

/**
 * Overview layout. On large screens the cards sit in a 12-column grid sized so the whole page
 * fits one viewport when there isn't much data. A connected Stripe history is long, so it gets
 * its own full-width row at the end instead of stretching the grid above it.
 */
export function DashboardView(props: DashboardViewProps) {
  const { stripe } = props
  return (
    <div className="flex flex-col gap-6 [@media(max-height:1000px)]:lg:gap-5">
      <div className="rise flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between" style={{ "--i": 0 } as React.CSSProperties}>
        <div>
          <p className="text-sm text-muted-foreground">{props.today}</p>
          <h1 className="font-heading mt-1 text-4xl tracking-tight">
            {props.greeting}
            {props.displayName ? `, ${props.displayName}` : ""}
          </h1>
          <p className="mt-2 text-muted-foreground">{props.subline}</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/income#add">
            <Plus aria-hidden="true" />
            Add income
          </Link>
        </Button>
      </div>

      <div className="rise" style={{ "--i": 1 } as React.CSSProperties}>
        <KpiRow
          monthKey={props.monthKey}
          change={props.change}
          average={props.average}
          sourceCount={props.sourceCount}
          stepsDone={props.steps.filter((step) => step.done).length}
          stepsTotal={props.steps.length}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-12 [@media(max-height:1000px)]:lg:gap-5 ">
        <div className="rise md:col-span-2 xl:col-span-7" style={{ "--i": 2 } as React.CSSProperties}>
          <IncomeChart months={props.months} sources={props.bySource} className="h-full" />
        </div>
        <div className="rise xl:col-span-5" style={{ "--i": 3 } as React.CSSProperties}>
          <ProfileProgressCard steps={props.steps} className="h-full" />
        </div>
        <div className="rise md:col-span-2 xl:col-span-5" style={{ "--i": 4 } as React.CSSProperties}>
          <RecentIncome entries={props.recent} className="h-full" />
        </div>
        <div className="rise xl:col-span-3" style={{ "--i": 5 } as React.CSSProperties}>
          <ManikkaCard insight={props.insight} className="h-full" />
        </div>
        <div className="rise flex flex-col gap-6 xl:col-span-4" style={{ "--i": 6 } as React.CSSProperties}>
          {stripe.connected ? null : <StripeIncomeCard connected={false} />}
          <ComingSoonCard className="flex-1" />
        </div>
      </div>

      {stripe.connected ? (
        <div className="rise" style={{ "--i": 7 } as React.CSSProperties}>
          <StripeIncomeCard connected accountId={stripe.accountId} />
        </div>
      ) : null}
    </div>
  )
}
