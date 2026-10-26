import Link from "next/link"
import { Inbox } from "lucide-react"
import { IncomeList } from "@/components/income/income-list"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { IncomeEntry } from "@/lib/income"

export function RecentIncome({ entries }: { entries: IncomeEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent income</CardTitle>
        <CardAction>
          <Link href="/income" className="text-sm font-medium text-primary">
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {entries.length ? (
          <IncomeList entries={entries} />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/60 px-4 py-8 text-center">
            <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No income yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Log a brand deal, YouTube payout, or M-Pesa payment to see it here.
            </p>
            <Link href="/income#add" className="mt-1 text-sm font-medium text-primary">
              Add income
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
