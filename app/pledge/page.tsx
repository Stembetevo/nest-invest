"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PledgeForm } from "@/components/pledge-form"
import { Button } from "@/components/ui/button"
import { getAuction, getFeaturedAuction } from "@/lib/auctions"
import { formatTenor } from "@/lib/money"

export default function PledgePage() {
  return (
    <Suspense>
      <PledgeContent />
    </Suspense>
  )
}

function PledgeContent() {
  const searchParams = useSearchParams()
  const auction = (searchParams.get("auction") ? getAuction(searchParams.get("auction")!) : null) ?? getFeaturedAuction()

  if (!auction) {
    return (
      <EmptyPledge
        title="No open auction"
        body="This week’s books are closed. Turn on alerts and we will ping you before the next CBK sale."
      />
    )
  }

  if (auction.status !== "open") {
    return (
      <EmptyPledge
        title="Auction closed"
        body={`The ${formatTenor(auction.tenorDays)} bill is no longer taking pledges. Watch the next sale from Alerts.`}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          3-tap pledge
        </p>
        <h1 className="font-heading mt-1 text-3xl tracking-tight">
          {formatTenor(auction.tenorDays)} T-bill
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          nest does not warehouse your cash as an investment product. We route this pledge into
          the current Treasury bill auction.
        </p>
      </div>
      <PledgeForm auction={auction} />
    </div>
  )
}

function EmptyPledge({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-card px-5 py-10 text-center ring-1 ring-foreground/10">
      <h1 className="font-heading text-3xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild>
          <Link href="/alerts">Turn on alerts</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  )
}
