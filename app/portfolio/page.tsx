"use client"

import Link from "next/link"
import { Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getAuction, getFeaturedAuction } from "@/lib/auctions"
import { formatLongDate } from "@/lib/dates"
import { formatKes, formatRate, formatTenor } from "@/lib/money"
import { useNestStore } from "@/lib/store"
import type { Pledge, PledgeStatus } from "@/lib/types"

const STATUS_COPY: Record<PledgeStatus, string> = {
  pending_auction: "Pending auction",
  allotted: "Allotted",
  matured: "Matured",
}

export default function PortfolioPage() {
  const { pledges } = useNestStore()
  const featured = getFeaturedAuction()

  const pledged = pledges.reduce((sum, item) => sum + item.amount, 0)
  const earn = pledges.reduce((sum, item) => sum + item.youEarn, 0)
  const fees = pledges.reduce((sum, item) => sum + item.nestFee, 0)

  if (!pledges.length) {
    return (
      <div className="rounded-3xl bg-card px-5 py-10 text-center ring-1 ring-foreground/10">
        <Wallet className="mx-auto size-8 text-primary" />
        <h1 className="font-heading mt-4 text-3xl">No pledges yet</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Start at KSh 100. When you pledge, this page tracks principal, expected interest, and
          nest’s 1% of that interest.
        </p>
        <Button asChild size="lg" className="mt-6 h-12">
          <Link href={featured ? `/pledge?auction=${featured.id}` : "/"}>
            Pledge from KSh 100
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          Your book
        </p>
        <h1 className="font-heading mt-1 text-3xl tracking-tight">Portfolio</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Pledged" value={formatKes(pledged, 0)} />
        <Summary label="You earn" value={formatKes(earn)} />
        <Summary label="nest fee" value={formatKes(fees)} />
      </div>

      <div className="space-y-3">
        {pledges.map((pledge) => (
          <PledgeRow key={pledge.id} pledge={pledge} />
        ))}
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10">
      <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
        {label}
      </p>
      <p className="font-heading mt-1 text-2xl">{value}</p>
    </div>
  )
}

function PledgeRow({ pledge }: { pledge: Pledge }) {
  const auction = getAuction(pledge.auctionId)
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">
              {formatTenor(pledge.tenorDays)} · {formatRate(pledge.annualRate)}
            </p>
            <p className="text-sm text-muted-foreground">Receipt {pledge.receiptCode}</p>
          </div>
          <Badge variant={pledge.status === "pending_auction" ? "default" : "secondary"}>
            {STATUS_COPY[pledge.status]}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Pledged</p>
            <p className="font-medium">{formatKes(pledge.amount, 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">You earn</p>
            <p className="font-medium">{formatKes(pledge.youEarn)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">nest fee</p>
            <p className="font-medium">{formatKes(pledge.nestFee)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payout</p>
            <p className="font-medium">{formatLongDate(pledge.payoutDate)}</p>
          </div>
        </div>
        {auction?.status === "open" ? (
          <p className="text-xs text-muted-foreground">
            Still in the live book. Add another pledge from the auction screen.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
