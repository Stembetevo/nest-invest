import Link from "next/link"
import { EarlyAccessForm, SharingExample } from "@/components/landing-examples"
import { ManikkaWordmark } from "@/components/manikka-mark"
import { SiteMenu } from "@/components/site-menu"

const PROBLEMS = [
  {
    title: "Scattered income",
    body: "Brand deals, YouTube, gigs and more, with no single record.",
  },
  {
    title: "No payslip",
    body: "No proof means no loan.",
  },
  {
    title: "No credit history",
    body: "Lenders can’t price what they can’t read.",
  },
]

const LENDER_POINTS = [
  "Income you can trust.",
  "A capacity score, not just a credit score.",
  "Consent-based by design.",
]

const ROADMAP = [
  { label: "Now", body: "Income tracking and Manikka." },
  { label: "Next", body: "Verified income reports and credit limits." },
  { label: "Coming soon", body: "Stablecoin-powered credit." },
]

const FOOTER_LINKS = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "X", href: "https://x.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "Contact", href: "mailto:?subject=Contact%20Manikka" },
]

export function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" aria-label="Manikka home">
            <ManikkaWordmark />
          </Link>
          <SiteMenu />
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
              Income. Proof. Credit.
            </p>
            <h1 className="font-heading mt-4 max-w-xl text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              Prove your income. Unlock credit.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Manikka turns informal earnings into a verified income report lenders can trust.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center rounded-lg bg-[var(--gold)] px-5 text-base font-medium text-primary-foreground hover:bg-[var(--gold)]/90"
              >
                Get started
              </Link>
              <a
                href="#manikka"
                className="text-sm font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
              >
                See it in action
              </a>
            </div>
          </div>
          <IncomeChart />
        </section>

        <section id="problem" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
              The problem
            </p>
            <h2 className="font-heading mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl">
              You get paid. Banks can’t see it.
            </h2>
            <div className="mt-10 grid border-y border-white/15 sm:grid-cols-3 sm:divide-x sm:divide-white/15">
              {PROBLEMS.map((item) => (
                <div key={item.title} className="py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <h3 className="text-base font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="manikka" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
                Meet Manikka
              </p>
              <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
                A CFO for every informal earners.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Manikka tracks your cash flow, plans your tax set-aside and tells you what you can
                afford.
              </p>
            </div>
            <article className="rounded-2xl border border-white/10 bg-card p-5 sm:p-6">
              <p className="inline-flex rounded-md border border-[var(--gold)]/50 px-2 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--gold)] uppercase">
                Example
              </p>
              <p className="mt-4 rounded-lg bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                Can I afford a new camera?
              </p>
              <p className="mt-3 border-l-2 border-[var(--gold)] px-4 py-3 text-sm leading-relaxed">
                Your 3-month average is KES 62,000. Keep a loan payment under KES 12,000 a month.
              </p>
            </article>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
                Privacy and control
              </p>
              <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
                Your data. Your call.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                You choose what is shared, with whom, and for how long. You can revoke access any
                time.
              </p>
            </div>
            <SharingExample />
          </div>
        </section>

        <section id="lenders" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
                For lenders and fintechs
              </p>
              <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
                Verified income, through one API.
              </h2>
            </div>
            <div>
              <ul className="space-y-3 text-sm">
                {LENDER_POINTS.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span aria-hidden="true" className="text-muted-foreground">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:?subject=Partner%20with%20Manikka"
                className="mt-8 inline-flex h-12 items-center rounded-lg bg-[var(--gold)] px-5 text-base font-medium text-primary-foreground hover:bg-[var(--gold)]/90"
              >
                Partner with us
              </a>
            </div>
          </div>
        </section>

        <section id="roadmap" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
              Roadmap
            </p>
            <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
              Where we are going.
            </h2>
            <div className="mt-10 grid border-y border-white/15 sm:grid-cols-3 sm:divide-x sm:divide-white/15">
              {ROADMAP.map((item) => (
                <div key={item.label} className="py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <p className="inline-flex rounded-md border border-[var(--gold)]/50 px-2 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--gold)] uppercase">
                    {item.label}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="next" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
              The next step
            </p>
            <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
              Ready to prove what you earn?
            </h2>
            <EarlyAccessForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <ManikkaWordmark />
          <nav aria-label="Footer" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {FOOTER_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground underline underline-offset-4 hover:text-[var(--gold)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 max-w-xl space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>Manikka is a technology provider. Credit is offered by licensed lending partners.</p>
            <p>
              Interactive prototype. App figures and conversations are examples, not offers or
              financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function IncomeChart() {
  return (
    <svg
      viewBox="0 0 480 280"
      className="w-full text-[var(--gold)]"
      role="img"
      aria-label="Illustrative rising income line"
    >
      <line x1="24" y1="40" x2="456" y2="40" stroke="currentColor" strokeOpacity="0.15" />
      <line x1="24" y1="110" x2="456" y2="110" stroke="currentColor" strokeOpacity="0.15" />
      <line x1="24" y1="180" x2="456" y2="180" stroke="currentColor" strokeOpacity="0.15" />
      <path
        d="M32 200 C 90 190, 120 170, 160 150 S 240 120, 280 108 S 360 70, 448 42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M32 200 C 90 190, 120 170, 160 150 S 240 120, 280 108 S 360 70, 448 42 V 230 H 32 Z"
        fill="currentColor"
        opacity="0.08"
      />
    </svg>
  )
}
