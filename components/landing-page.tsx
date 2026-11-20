"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  ArrowRight,
  Banknote,
  Check,
  Lock,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { ManikkaWordmark } from "@/components/manikka-mark"
import { NAV_LINKS, isLandingView, type LandingView } from "@/components/nav-links"
import { SiteHeader } from "@/components/site-header"
import { SAMPLE_REPORT } from "@/lib/income"
import { formatKes } from "@/lib/money"
import { cn } from "@/lib/utils"

const FEATURES = [
  { icon: Wallet, title: "One place for every payer", body: "Log brand deals, M-Pesa, YouTube payouts and client invoices in KSh, with sources you pick." },
  { icon: TrendingUp, title: "See your real monthly income", body: "Month-over-month change, a six-month average and a breakdown by source, updated as you add income." },
  { icon: Banknote, title: "Connect Stripe", body: "Sync card and international payouts so they count toward the same report." },
  { icon: ShieldCheck, title: "A verified income score", body: "Repeating payers and steady months build a score a loan officer can read at a glance." },
  { icon: Share2, title: "Share with a lender, once", body: "Send a report only when you decide to. Lenders see the summary, never your raw statement." },
  { icon: Sparkles, title: "Ask Manikka", body: "Ask plain questions: which client pays most, what changed this month, what to fix before you apply." },
]

const STEPS = [
  { title: "Add your income", body: "Log it by hand or connect Stripe. Pick the sources you earn from." },
  { title: "Build your profile", body: "Two months of steady entries, plus the five profile steps, make a report ready." },
  { title: "Share your report", body: "Send the score and six-month pattern to a lender. They pay for it. You don’t." },
]

const FAQ = [
  { q: "Do I need a payslip or bank statement?", a: "No. Your own income log and connected sources are the record. That is the point." },
  { q: "Do you ever see my M-Pesa PIN or move my money?", a: "No. Manikka never asks for a PIN, never holds funds and never issues a loan." },
  { q: "Who can see my report?", a: "Only you, until you share it. A lender sees your score, monthly income and the pattern behind it." },
  { q: "Is Manikka a lender or credit bureau?", a: "No. Manikka produces income proof. Lenders make their own decisions." },
  { q: "What does it cost?", a: "Nothing for you. Lenders pay KSh 500 for each report you approve." },
]

const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties

/* ---------------------------------------------------------------- */
/* View state, kept in the URL hash so links and Back both work      */
/* ---------------------------------------------------------------- */

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback)
  window.addEventListener("popstate", callback)
  return () => {
    window.removeEventListener("hashchange", callback)
    window.removeEventListener("popstate", callback)
  }
}
function readView(): LandingView {
  const hash = window.location.hash.replace(/^#/, "")
  return isLandingView(hash) ? hash : "home"
}

const primaryCta =
  "inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-8 text-base font-semibold text-primary-foreground shadow-[0_14px_30px_-14px_var(--gold)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--gold)]/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
const ghostCta =
  "inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-white/15 px-8 text-base font-medium transition-colors hover:bg-white/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

/* ---------------------------------------------------------------- */
/* Pieces                                                            */
/* ---------------------------------------------------------------- */

function ScoreRing({ score }: { score: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-16 shrink-0" role="img" aria-label={`Income score ${score} out of 100`}>
      <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke="var(--gold)" strokeWidth="6" strokeLinecap="round"
          className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
          style={{ "--ring-c": c } as React.CSSProperties}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{score}</span>
    </div>
  )
}

function ReportPreview() {
  const peak = Math.max(...SAMPLE_REPORT.months.map((m) => m.inflow))
  return (
    <article aria-label="Sample income report" className="hero-panel w-full rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Income report for</p>
          <p className="text-lg font-medium">
            {SAMPLE_REPORT.name}, {SAMPLE_REPORT.place}
          </p>
        </div>
        <ScoreRing score={SAMPLE_REPORT.score} />
      </div>
      <p className="mt-5 text-sm text-muted-foreground">Verified monthly income</p>
      <p className="font-heading text-4xl tracking-tight sm:text-5xl">{formatKes(SAMPLE_REPORT.monthlyIncome)}</p>
      <div className="mt-7 flex h-32 items-end gap-3" aria-hidden="true">
        {SAMPLE_REPORT.months.map((m, i) => (
          <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="grow-y w-full rounded-t-md bg-[var(--gold)]/85"
              style={{ height: `${Math.max(14, (m.inflow / peak) * 84)}px`, ...stagger(i) }}
            />
            <span className="text-[11px] text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
      <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-sm">
        {SAMPLE_REPORT.sources.map((s) => (
          <li key={s.name} className="flex justify-between gap-3">
            <span className="text-muted-foreground">{s.name}</span>
            <span className="font-medium">{s.share}%</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function NextLink({ to, onNavigate }: { to: LandingView; onNavigate: (v: LandingView) => void }) {
  const next = NAV_LINKS.find((l) => l.id === to)
  return (
    <button
      type="button"
      onClick={() => onNavigate(to)}
      className="group inline-flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--gold)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      Next: {next?.label}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
    </button>
  )
}

function ViewHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="rise text-sm font-medium tracking-wide text-[var(--gold)] uppercase" style={stagger(0)}>{eyebrow}</p>
      <h2 className="rise font-heading mt-3 text-4xl tracking-tight sm:text-5xl" style={stagger(1)}>{title}</h2>
      {body ? <p className="rise mt-4 text-lg text-muted-foreground" style={stagger(2)}>{body}</p> : null}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Views                                                             */
/* ---------------------------------------------------------------- */

function HomeView({ signedIn, onNavigate }: { signedIn: boolean; onNavigate: (v: LandingView) => void }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
      <div>
        <p className="rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-muted-foreground" style={stagger(0)}>
          <span className="size-1.5 rounded-full bg-[var(--gold)]" aria-hidden="true" />
          Income proof for people paid without a payslip
        </p>
        <h1 className="rise font-heading mt-6 max-w-xl text-5xl tracking-tight sm:text-6xl xl:text-7xl" style={stagger(1)}>
          Every shilling you earn, on the record.
        </h1>
        <p className="rise mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed" style={stagger(2)}>
          Track income from M-Pesa, Stripe and clients in one dashboard. Manikka turns it into a verified report lenders can read, free for you.
        </p>
        <div className="rise mt-9 flex flex-col gap-4 sm:flex-row sm:items-center" style={stagger(3)}>
          <Link href={signedIn ? "/dashboard" : "/signup"} className={primaryCta}>
            {signedIn ? "Open your dashboard" : "Sign up"}
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <button type="button" onClick={() => onNavigate("how")} className={ghostCta}>
            See how it works
          </button>
        </div>
        <ul className="mt-9 space-y-2.5 text-[0.95rem] text-muted-foreground">
          {["No payslip or bank form needed", "You decide who sees your report", "Never asks for your M-Pesa PIN"].map((t, i) => (
            <li key={t} className="rise flex items-center gap-2" style={stagger(4 + i)}>
              <Check className="size-4 text-[var(--gold)]" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="rise w-full lg:max-w-md lg:justify-self-end xl:max-w-lg" style={stagger(3)}>
        <ReportPreview />
      </div>
    </div>
  )
}

function FeaturesView({ onNavigate }: { onNavigate: (v: LandingView) => void }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      <ViewHeading
        eyebrow="Features"
        title="You get paid. Banks just can’t see it yet."
        body="Informal income is real income. Manikka gives it the file a lender expects."
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="rise surface lift rounded-3xl p-6 lg:p-7" style={stagger(i + 2)}>
            <div className="flex items-center gap-4">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--gold)]/12 text-[var(--gold)]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-xl">{title}</h3>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8"><NextLink to="how" onNavigate={onNavigate} /></div>
    </div>
  )
}

function HowView({ signedIn, onNavigate }: { signedIn: boolean; onNavigate: (v: LandingView) => void }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      <ViewHeading eyebrow="How it works" title="From daily income to a lender-ready report" />
      <ol className="relative mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <span aria-hidden="true" className="grow-x absolute top-[3.25rem] right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent lg:block" style={stagger(3)} />
        {STEPS.map((s, i) => (
          <li key={s.title} className="rise surface lift relative rounded-3xl p-8" style={stagger(i + 2)}>
            <span className="flex size-12 items-center justify-center rounded-full bg-[var(--gold)] text-base font-semibold text-primary-foreground shadow-[0_10px_24px_-10px_var(--gold)]">{i + 1}</span>
            <h3 className="mt-6 font-heading text-2xl">{s.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={stagger(6)}>
        <Link href={signedIn ? "/dashboard" : "/signup"} className={primaryCta}>
          {signedIn ? "Open your dashboard" : "Start building your income record"}
        </Link>
        <NextLink to="pricing" onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function PricingView({ signedIn, onNavigate }: { signedIn: boolean; onNavigate: (v: LandingView) => void }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
      <ViewHeading eyebrow="Pricing" title="Free for you. Lenders pay for the proof." />
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:gap-8">
        <article className="rise surface lift relative rounded-[2rem] border border-[var(--gold)]/40 p-8" style={stagger(2)}>
          <span className="absolute top-6 right-6 rounded-full bg-[var(--gold)]/15 px-3 py-1 text-xs font-medium text-[var(--gold)]">Most people</span>
          <h3 className="text-muted-foreground">For earners</h3>
          <p className="font-heading mt-3 text-5xl">KSh 0</p>
          <ul className="mt-7 space-y-3 text-[0.95rem] text-muted-foreground">
            {["Unlimited income logging", "Dashboard, charts and Manikka chat", "Stripe sync", "Share a report when you choose"].map((t) => (
              <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[var(--gold)]" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <Link href={signedIn ? "/dashboard" : "/signup"} className={`${primaryCta} mt-9 w-full sm:w-auto`}>
            {signedIn ? "Open your dashboard" : "Sign up"}
          </Link>
        </article>
        <article className="rise rounded-[2rem] border border-white/10 p-8" style={stagger(3)}>
          <h3 className="text-muted-foreground">For lenders</h3>
          <p className="font-heading mt-3 text-5xl">KSh 500</p>
          <p className="text-sm text-muted-foreground">per approved report</p>
          <p className="mt-7 flex gap-3 leading-relaxed text-muted-foreground">
            <Lock className="mt-1 size-4 shrink-0" aria-hidden="true" />
            Lenders pay only when you share. The fee covers the proof, not your loan.
          </p>
        </article>
      </div>
      <div className="mt-8"><NextLink to="faq" onNavigate={onNavigate} /></div>
    </div>
  )
}

function FaqView({ signedIn }: { signedIn: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div>
        <ViewHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="rise mt-8" style={stagger(3)}>
          <Link href={signedIn ? "/dashboard" : "/signup"} className={primaryCta}>
            {signedIn ? "Open your dashboard" : "Sign up"}
          </Link>
        </div>
      </div>
      <div className="divide-y divide-white/10 border-y border-white/10">
        {FAQ.map((item, i) => {
          const open = openIndex === i
          return (
            <div key={item.q} className="rise" style={stagger(i + 2)}>
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {item.q}
                  <Plus aria-hidden="true" className={cn("size-5 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-45 text-[var(--gold)]")} />
                </button>
              </h3>
              <div
                id={`faq-${i}`}
                role="region"
                className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
              >
                <div className="overflow-hidden">
                  <p className="max-w-2xl pb-5 leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Page                                                              */
/* ---------------------------------------------------------------- */

export function LandingPage({ signedIn = false }: { signedIn?: boolean }) {
  const target = useSyncExternalStore(subscribe, readView, () => "home" as LandingView)
  const [shown, setShown] = useState<LandingView>(target)
  const [leaving, setLeaving] = useState(false)
  const dir = useRef(1)

  const navigate = useCallback((view: LandingView) => {
    if (readView() === view) return
    const url = view === "home" ? window.location.pathname + window.location.search : `#${view}`
    window.history.pushState(null, "", url)
    window.dispatchEvent(new Event("popstate"))
  }, [])

  // Play the exit animation, swap the view, then the new one animates in.
  useEffect(() => {
    if (target === shown) return
    const order = NAV_LINKS.map((l) => l.id as string)
    dir.current = order.indexOf(target) >= order.indexOf(shown) ? 1 : -1
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setLeaving(true)
    const t = window.setTimeout(() => {
      setShown(target)
      setLeaving(false)
      window.scrollTo({ top: 0 })
    }, reduce ? 0 : 180)
    return () => window.clearTimeout(t)
  }, [target, shown])

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      {/* Soft drifting glow behind everything */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="orb-a absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="orb-b absolute top-1/3 -left-40 size-[36rem] rounded-full bg-[oklch(0.45_0.1_258/0.35)] blur-3xl" />
      </div>

      <SiteHeader signedIn={signedIn} current={target} onNavigate={navigate} />

      <main className="flex flex-1 items-center py-8 sm:py-10" style={{ "--dir": dir.current } as React.CSSProperties}>
        <div key={shown} className={cn("w-full", leaving ? "view-leave" : "view-enter")}>
          {shown === "home" ? <HomeView signedIn={signedIn} onNavigate={navigate} /> : null}
          {shown === "features" ? <FeaturesView onNavigate={navigate} /> : null}
          {shown === "how" ? <HowView signedIn={signedIn} onNavigate={navigate} /> : null}
          {shown === "pricing" ? <PricingView signedIn={signedIn} onNavigate={navigate} /> : null}
          {shown === "faq" ? <FaqView signedIn={signedIn} /> : null}
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <ManikkaWordmark />
          <p className="leading-relaxed">
            Manikka is not a lender, bank or licensed credit bureau. © {new Date().getFullYear()} Manikka.
          </p>
          <nav aria-label="Footer" className="flex gap-5 text-sm">
            <Link href="/login" className="hover:text-foreground">Log in</Link>
            <Link href="/signup" className="hover:text-foreground">Sign up</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
