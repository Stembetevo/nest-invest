"use client"

import { Bell } from "lucide-react"
import { toast } from "sonner"
import { AuctionCard } from "@/components/auction-card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { getAuctions } from "@/lib/auctions"
import { formatTenor } from "@/lib/money"
import { saveState, useNestStore } from "@/lib/store"

export default function AlertsPage() {
  const { alertsEnabled, watchedAuctionIds } = useNestStore()
  const auctions = getAuctions()
  const open = auctions.filter((auction) => auction.status === "open")
  const upcoming = auctions.filter((auction) => auction.status === "upcoming")
  const closed = auctions.filter((auction) => auction.status === "closed")

  const toggleMaster = (on: boolean) => {
    saveState((prev) => ({
      ...prev,
      alertsEnabled: on,
      watchedAuctionIds: on
        ? Array.from(new Set([...prev.watchedAuctionIds, ...open.map((item) => item.id), ...upcoming.map((item) => item.id)]))
        : prev.watchedAuctionIds,
    }))
    toast.success(
      on
        ? "Auction alerts on. We will pretend to SMS you before books close."
        : "Auction alerts off."
    )
  }

  const toggleWatch = (id: string, on: boolean) => {
    saveState((prev) => ({
      ...prev,
      watchedAuctionIds: on
        ? Array.from(new Set([...prev.watchedAuctionIds, id]))
        : prev.watchedAuctionIds.filter((item) => item !== id),
      alertsEnabled: on ? true : prev.alertsEnabled,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          Phase 1
        </p>
        <h1 className="font-heading mt-1 text-3xl tracking-tight">Auction alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Banks bury the calendar. nest tells you when CBK is selling, what the rate is, and lets
          you pledge from the same screen. SMS is simulated in this demo — nothing leaves the
          phone.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="font-medium">Ping me before books close</p>
            <p className="text-sm text-muted-foreground">
              {alertsEnabled ? "Alerts on for open and upcoming sales." : "Off — you will only see auctions in the app."}
            </p>
          </div>
        </div>
        <Switch
          checked={alertsEnabled}
          onCheckedChange={toggleMaster}
          aria-label="Toggle auction alerts"
        />
      </div>

      <AlertGroup title="Open now" empty="No open auctions this week.">
        {open.map((auction) => (
          <div key={auction.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{formatTenor(auction.tenorDays)}</p>
              <div className="flex items-center gap-2">
                {watchedAuctionIds.includes(auction.id) ? (
                  <Badge variant="secondary">Watching</Badge>
                ) : null}
                <Switch
                  size="sm"
                  checked={watchedAuctionIds.includes(auction.id)}
                  onCheckedChange={(on) => toggleWatch(auction.id, on)}
                  aria-label={`Watch ${formatTenor(auction.tenorDays)} auction`}
                />
              </div>
            </div>
            <AuctionCard auction={auction} action="pledge" />
          </div>
        ))}
      </AlertGroup>

      <AlertGroup title="Upcoming" empty="Nothing on the next calendar yet.">
        {upcoming.map((auction) => (
          <div key={auction.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10">
            <div>
              <p className="font-medium">{formatTenor(auction.tenorDays)}</p>
              <p className="text-sm text-muted-foreground">Next week’s sale</p>
            </div>
            <Switch
              checked={watchedAuctionIds.includes(auction.id)}
              onCheckedChange={(on) => toggleWatch(auction.id, on)}
              aria-label={`Watch upcoming ${formatTenor(auction.tenorDays)}`}
            />
          </div>
        ))}
      </AlertGroup>

      <AlertGroup title="Last week" empty="No closed auctions to show.">
        {closed.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} action="none" />
        ))}
      </AlertGroup>
    </div>
  )
}

function AlertGroup({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: React.ReactNode
}) {
  const items = Array.isArray(children) ? children : [children]
  if (!items.filter(Boolean).length) {
    return (
      <section className="space-y-2">
        <h2 className="font-heading text-2xl">{title}</h2>
        <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">{empty}</p>
      </section>
    )
  }
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-2xl">{title}</h2>
      {children}
    </section>
  )
}
