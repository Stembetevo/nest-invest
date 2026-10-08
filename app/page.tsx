import Link from "next/link"
import { ArrowRight, Route, ShieldCheck, Smartphone } from "lucide-react"
import { AuctionCard } from "@/components/auction-card"
import { Button } from "@/components/ui/button"
import {
  getClosedHighlight,
  getFeaturedAuction,
  getOpenAuctions,
  TYPICAL_MMF_RATE,
} from "@/lib/auctions"
import { formatOversubscription, formatRate } from "@/lib/money"

export default function HomePage() {
  const featured = getFeaturedAuction()
  const lastWeek = getClosedHighlight()
  const others = getOpenAuctions().filter((auction) => auction.id !== featured?.id)

  return (
    <div className="space-y-8">
      <section className="hero-panel rounded-3xl px-5 py-7 text-primary-foreground sm:px-8">
        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-(--gold)">
          Government paper · M-Pesa rails
        </p>
        <h1 className="font-heading mt-3 max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          M-Pesa for Treasury Bills.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
          The government is paying {featured ? formatRate(featured.annualRate) : "15.12%"} right
          now. Last week’s 91-day auction was{" "}
          {lastWeek?.oversubscription
            ? formatOversubscription(lastWeek.oversubscription)
            : "204% oversubscribed"}
          , but most Kenyans still cannot get in because banks made it complicated. nest lets
          anyone start at KSh 100, pledge in 3 taps, and earn those rates directly.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 bg-(--gold) px-5 text-base text-primary hover:bg-(--gold)/90"
          >
            <Link href={featured ? `/pledge?auction=${featured.id}` : "/pledge"}>
              Pledge from KSh 100
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-12 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/how-it-works">How nest routes</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="This week, 91-day"
          value={featured ? formatRate(featured.annualRate) : "15.12%"}
        />
        <Stat label="Typical MMF" value={formatRate(TYPICAL_MMF_RATE)} hint="Why cash sits in banks" />
        <Stat
          label="Last 91-day take-up"
          value={lastWeek?.oversubscription ? `${Math.round(lastWeek.oversubscription * 100)}%` : "204%"}
          hint="Oversubscribed"
        />
      </section>

      {featured ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-heading text-2xl">This week’s auction</h2>
            <Link href="/alerts" className="text-sm font-medium text-primary">
              Get alerts
            </Link>
          </div>
          <AuctionCard auction={featured} featured action="pledge" />
        </section>
      ) : null}

      {others.length ? (
        <section className="space-y-3">
          <h2 className="font-heading text-2xl">Other open tenors</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} action="pledge" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <Trust
          icon={Smartphone}
          title="3 taps"
          body="Amount, STK confirm, M-Pesa PIN. Same muscle memory as paying a bill."
        />
        <Trust
          icon={ShieldCheck}
          title="We don’t take risk"
          body="nest routes. Your claim is on government paper, not on our balance sheet."
        />
        <Trust
          icon={Route}
          title="DhowCSD (demo)"
          body="Phase 1 is alerts + pledging. Settlement is modelled on Central Bank rails."
        />
      </section>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10">
      <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground">
        {label}
      </p>
      <p className="font-heading mt-1 text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function Trust({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Smartphone
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10">
      <Icon className="size-5 text-primary" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
