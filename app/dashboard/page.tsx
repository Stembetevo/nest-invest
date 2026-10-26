"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { ManikkaWordmark } from "@/components/manikka-mark"
import { Button } from "@/components/ui/button"
import { reportCode } from "@/lib/income"
import { displayPhone, formatKes } from "@/lib/money"
import { shareReport, signOut, useHydrated, useManikkaStore, verifyIncome } from "@/lib/store"

export default function DashboardPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const session = useManikkaStore()
  const [reading, setReading] = useState(false)
  const signingOut = useRef(false)

  useEffect(() => {
    if (hydrated && !session.signedInAt && !signingOut.current) router.replace("/sign-in")
  }, [hydrated, session.signedInAt, router])

  useEffect(() => {
    if (!reading) return
    const timer = window.setTimeout(() => {
      verifyIncome()
      setReading(false)
      toast.success("Income verified from six months of inflows.")
    }, 900)
    return () => window.clearTimeout(timer)
  }, [reading])

  const leave = () => {
    signingOut.current = true
    signOut()
    router.replace("/")
  }

  const share = () => {
    shareReport()
    toast.success("Report shared. A lender can now read the proof, not the raw statement.")
  }

  if (!hydrated || !session.signedInAt) {
    return (
      <div className="min-h-dvh">
        <p className="px-5 py-16 text-sm text-muted-foreground">Opening your report…</p>
      </div>
    )
  }

  const verified = session.reportStatus === "verified"
  const peak = Math.max(1, ...session.months.map((month) => month.inflow))
  const code = reportCode(session.phone)

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="Manikka home">
            <ManikkaWordmark />
          </Link>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">Dashboard</p>
            <Button variant="outline" className="h-9 border-white/15 bg-transparent" onClick={leave}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
          {displayPhone(session.phone)}
        </p>
        <h1 className="font-heading mt-2 text-4xl tracking-tight">
          {session.name.split(" ")[0]}, your income file.
        </h1>

        {verified ? (
          <div className="mt-10 space-y-8">
            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-3xl border border-white/10 bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Verified monthly income
                    </p>
                    <p className="font-heading mt-2 text-5xl">{formatKes(session.monthlyIncome)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Average of the last six months of inflows. Report {code}.
                    </p>
                  </div>
                  <ScoreRing score={session.score} />
                </div>
                <div className="mt-8 flex h-28 items-end gap-2">
                  {session.months.map((month) => (
                    <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-sm bg-[var(--gold)]"
                        style={{ height: `${Math.max(8, (month.inflow / peak) * 88)}px` }}
                        title={`${month.label}: ${formatKes(month.inflow)}`}
                      />
                      <span className="text-[10px] text-muted-foreground">{month.label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Monthly inflows, simulated from a statement on this device.
                </p>
              </article>

              <article className="rounded-3xl border border-white/10 p-6">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Where it comes from
                </p>
                <ul className="mt-5 space-y-4">
                  {session.sources.map((source) => (
                    <li key={source.name}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span>{source.name}</span>
                        <span className="text-muted-foreground">{source.share}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-[var(--gold)]"
                          style={{ width: `${source.share}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl border border-white/10 p-6">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Before Manikka
                </p>
                <p className="mt-3 text-sm leading-relaxed">
                  No payslip and no credit file. A lender had nothing to price.
                </p>
              </article>
              <article className="rounded-3xl border border-[var(--gold)]/40 p-6">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--gold)] uppercase">
                  What a lender sees
                </p>
                <p className="mt-3 text-sm leading-relaxed">
                  Score {session.score}, {formatKes(session.monthlyIncome)} a month, and the
                  pattern behind it. Not the raw statement.
                </p>
              </article>
            </section>

            <section className="flex flex-col items-start gap-3 border-t border-white/10 pt-8">
              {session.sharedWithLender ? (
                <p className="text-sm text-muted-foreground">
                  Shared. A lender can read report {code}. You can still see it here.
                </p>
              ) : (
                <p className="max-w-xl text-sm text-muted-foreground">
                  The report stays private until you share it. Lenders pay KSh 500 to read an
                  approved report. You pay nothing.
                </p>
              )}
              <Button className="h-12 px-5 text-base" onClick={share} disabled={session.sharedWithLender}>
                {session.sharedWithLender ? "Shared with a lender" : "Share with a lender"}
              </Button>
            </section>
          </div>
        ) : (
          <section className="mt-10 max-w-xl rounded-3xl border border-white/10 p-6">
            <h2 className="font-heading text-2xl">Connect six months of inflows</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Manikka reads repeating tills, paybills, and senders, then turns them into a monthly
              income. This demo builds that file on your device. It does not contact M-Pesa and it
              never asks for a PIN.
            </p>
            <Button
              className="mt-6 h-12 px-5 text-base"
              onClick={() => setReading(true)}
              disabled={reading}
            >
              {reading ? "Reading inflows…" : "Share statement"}
            </Button>
          </section>
        )}
      </main>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  return (
    <svg
      viewBox="0 0 84 84"
      className="size-20 shrink-0"
      role="img"
      aria-label={`Income score ${score} out of 100`}
    >
      <circle cx="42" cy="42" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
      <circle
        cx="42"
        cy="42"
        r={radius}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 42 42)"
      />
      <text x="42" y="48" textAnchor="middle" fill="currentColor" fontSize="18" fontFamily="var(--font-heading), serif">
        {score}
      </text>
    </svg>
  )
}
