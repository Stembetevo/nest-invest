"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getFeaturedAuction } from "@/lib/auctions"
import { resetDemo } from "@/lib/store"

const STEPS = [
  {
    n: "01",
    title: "See the auction",
    body: "Rates, tenor, and the close time sit on one screen — not a bank form and a CBK PDF.",
  },
  {
    n: "02",
    title: "Pledge from KSh 100",
    body: "Choose an amount. Confirm the STK. Enter your M-Pesa PIN. Three taps, same as a till payment.",
  },
  {
    n: "03",
    title: "We route. You earn Gov’t paper.",
    body: "nest is not the borrower. We aggregate retail pledges into the Treasury bill auction and take 1% of the interest — not of your principal.",
  },
]

export default function HowItWorksPage() {
  const featured = getFeaturedAuction()

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          nest · Nest Bills
        </p>
        <h1 className="font-heading mt-1 text-3xl tracking-tight sm:text-4xl">
          Banks made T-bills a maze. We made them a till number.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ninety-nine percent of Kenyans never see a Treasury bill because the minimums, CDS
          accounts, and auction windows live inside wholesale banking. nest is the retail door:
          M-Pesa in, government rate out.
        </p>
      </div>

      <ol className="space-y-3">
        {STEPS.map((step) => (
          <li key={step.n} className="rounded-2xl bg-card px-4 py-4 ring-1 ring-foreground/10">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--gold-ink)]">
              {step.n}
            </p>
            <p className="mt-1 font-heading text-xl">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="rounded-3xl bg-primary px-5 py-6 text-primary-foreground">
        <h2 className="font-heading text-2xl">How nest is paid</h2>
        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
          If you pledge KSh 10,000 into a 91-day bill at 15.12%, the interest is pro-rated for
          91/365. nest keeps 1% of that interest. The rest is yours. Later we earn on float and,
          in Phase 3, secondary-market trading fees. We do not take duration or credit risk on
          your cash.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-2xl">What is next</h2>
        <p className="text-sm text-muted-foreground">
          Phase 2 is auto-laddering so a nest balance can beat money-market funds without you
          watching every Wednesday. Phase 3 is a secondary market so T-bills stop feeling locked
          until maturity. This build is Phase 1 only: alerts and 1-tap pledging.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-12 flex-1">
          <Link href={featured ? `/pledge?auction=${featured.id}` : "/"}>Pledge from KSh 100</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 flex-1"
          onClick={() => {
            resetDemo()
            toast.message("Demo reset. Pledges and alerts cleared.")
          }}
        >
          Reset this demo
        </Button>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Demo product. Not a CMA-licensed collective investment scheme and not an offer of
        Central Bank of Kenya securities. M-Pesa, DhowCSD, and auction books are simulated. Do
        not send real money here.
      </p>
    </div>
  )
}
