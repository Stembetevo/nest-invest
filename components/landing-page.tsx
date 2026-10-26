import Link from "next/link"
import { SiteMenu } from "@/components/site-menu"
import { VeritasWordmark } from "@/components/veritas-mark"
import { SAMPLE_REPORT } from "@/lib/income"
import { formatKes } from "@/lib/money"

const PROBLEMS = [
  {
    title: "Informal income",
    body: "The money arrives. It never looks like a salary a credit officer can tick.",
  },
  {
    title: "No payslip",
    body: "There is no HR letter and no bank form. A till statement is the record.",
  },
  {
    title: "No credit history",
    body: "Without a file, the answer is no — even when the deposits are real.",
  },
]

const STEPS = [
  {
    n: "01",
    title: "Share your M-Pesa",
    body: "You approve six months of inflows. Veritas never sees your PIN and never moves the money.",
  },
  {
    n: "02",
    title: "We read the pattern",
    body: "Repeating tills, paybills, and regular senders become one monthly income.",
  },
  {
    n: "03",
    title: "Lenders get proof",
    body: "A report with a score, a range, and the months behind it. They pay to read it. You do not.",
  },
]

const QUESTIONS = [
  {
    q: "Where does the data come from?",
    a: "Six months of M-Pesa inflows you choose to share. The read looks for repeating payers. It does not ask for your PIN.",
  },
  {
    q: "Do you take the money?",
    a: "No. Veritas does not hold funds, issue the loan, or sit in the payment. Lenders pay when you approve a report.",
  },
  {
    q: "Who can see my report?",
    a: "Only you, until you share it. A lender sees the score, the monthly income, and the pattern — not your raw statement.",
  },
  {
    q: "What if my income is informal?",
    a: "That is the file we build. Till sales, paybills, and people who pay you on a rhythm all count when they repeat.",
  },
]

export function LandingPage() {
  const peak = Math.max(...SAMPLE_REPORT.months.map((month) => month.inflow))

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" aria-label="Veritas home">
            <VeritasWordmark />
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
              Veritas turns informal earnings into a verified income report lenders can trust.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/sign-in"
                className="inline-flex h-12 items-center rounded-lg bg-[var(--gold)] px-5 text-base font-medium text-primary-foreground hover:bg-[var(--gold)]/90"
              >
                Get started
              </Link>
              <a
                href="#proof"
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
            <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10">
              {PROBLEMS.map((item) => (
                <div key={item.title} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <h3 className="text-base font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
              The product
            </p>
            <h2 className="font-heading mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl">
              A file for income that never had one.
            </h2>
            <ol className="mt-10 grid gap-6 lg:grid-cols-3">
              {STEPS.map((step) => (
                <li key={step.n} className="border-t border-white/15 pt-5">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--gold)]">
                    {step.n}
                  </p>
                  <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="proof" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
                The proof
              </p>
              <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
                A profile for every informal earner.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Lenders stop asking for a payslip that does not exist. They read a score, a
                monthly income, and the six months that produced it.
              </p>
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Before
                  </dt>
                  <dd className="mt-1 text-sm">No payslip. No file. Declined.</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    After
                  </dt>
                  <dd className="mt-1 text-sm">Verified income a lender can price.</dd>
                </div>
              </dl>
            </div>

            <article className="rounded-3xl border border-white/10 bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Sample report
                  </p>
                  <p className="mt-1 text-lg font-medium">{SAMPLE_REPORT.name}</p>
                  <p className="text-sm text-muted-foreground">{SAMPLE_REPORT.place}</p>
                </div>
                <ScoreRing score={SAMPLE_REPORT.score} />
              </div>
              <p className="mt-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Verified monthly income
              </p>
              <p className="font-heading text-4xl">{formatKes(SAMPLE_REPORT.monthlyIncome)}</p>
              <div className="mt-6 flex h-24 items-end gap-2" aria-hidden="true">
                {SAMPLE_REPORT.months.map((month) => (
                  <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-sm bg-[var(--gold)]/80"
                      style={{ height: `${Math.max(12, (month.inflow / peak) * 72)}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{month.label}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
              Pricing
            </p>
            <h2 className="font-heading mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl">
              Free for you. Lenders pay for the report.
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl border border-white/10 p-6">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Earners
                </p>
                <p className="font-heading mt-3 text-4xl">KSh 0</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Connect a statement, read your own report, and choose when a lender may see it.
                </p>
              </article>
              <article className="rounded-3xl border border-[var(--gold)]/40 bg-white/5 p-6">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--gold)] uppercase">
                  Lenders
                </p>
                <p className="font-heading mt-3 text-4xl">KSh 500</p>
                <p className="mt-1 text-sm text-muted-foreground">per approved report</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  They pay when you share. The price is for the proof, not for your principal.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
              Questions
            </p>
            <h2 className="font-heading mt-3 text-3xl tracking-tight sm:text-4xl">
              What lenders will ask you too.
            </h2>
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {QUESTIONS.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="cursor-pointer list-none text-base font-medium [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span aria-hidden="true" className="text-muted-foreground group-open:hidden">
                        +
                      </span>
                      <span aria-hidden="true" className="hidden text-muted-foreground group-open:inline">
                        –
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:py-20">
            <h2 className="font-heading max-w-xl text-4xl tracking-tight sm:text-5xl">
              Ready to show what you earn?
            </h2>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center rounded-lg bg-[var(--gold)] px-5 text-base font-medium text-primary-foreground hover:bg-[var(--gold)]/90"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:justify-between">
          <div>
            <VeritasWordmark />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Income proof for people who get paid without a payslip.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Product
              </p>
              <a className="block hover:text-foreground" href="#product">
                How it works
              </a>
              <a className="block text-muted-foreground hover:text-foreground" href="#pricing">
                Pricing
              </a>
              <a className="block text-muted-foreground hover:text-foreground" href="#faq">
                Questions
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Account
              </p>
              <Link className="block text-muted-foreground hover:text-foreground" href="/sign-in">
                Sign in
              </Link>
              <Link className="block text-muted-foreground hover:text-foreground" href="/dashboard">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
        <p className="mx-auto max-w-6xl px-5 pb-8 text-[11px] leading-relaxed text-muted-foreground">
          Demo only. Statement reads stay on this device and are simulated. Veritas is not a
          licensed credit bureau, not a lender, and not an M-Pesa product.
        </p>
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

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  return (
    <svg viewBox="0 0 72 72" className="size-16 shrink-0" role="img" aria-label={`Sample score ${score} out of 100`}>
      <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="41" textAnchor="middle" fill="currentColor" fontSize="16" fontFamily="var(--font-heading), serif">
        {score}
      </text>
    </svg>
  )
}
