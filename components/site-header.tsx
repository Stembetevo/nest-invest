"use client"

import Link from "next/link"
import { useLayoutEffect, useRef, useState } from "react"
import { ManikkaWordmark } from "@/components/manikka-mark"
import { NAV_LINKS, type LandingView } from "@/components/nav-links"
import { SiteMenu } from "@/components/site-menu"
import { cn } from "@/lib/utils"

const cta =
  "h-11 items-center rounded-xl bg-[var(--gold)] px-5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-[var(--gold)]/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

export function SiteHeader({
  signedIn,
  current,
  onNavigate,
}: {
  signedIn: boolean
  current: LandingView
  onNavigate: (view: LandingView) => void
}) {
  const navRef = useRef<HTMLElement>(null)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  // Slide the highlight under whichever tab is current.
  useLayoutEffect(() => {
    const measure = () => {
      const el = navRef.current?.querySelector<HTMLElement>(`[data-view="${current}"]`)
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [current])

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Manikka home"
          onClick={(event) => {
            event.preventDefault()
            onNavigate("home")
          }}
        >
          <ManikkaWordmark />
        </Link>

        <nav
          ref={navRef}
          aria-label="Main"
          className="relative hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex"
        >
          {pill ? (
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 rounded-full bg-[var(--gold)]/15 ring-1 ring-[var(--gold)]/30 transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: pill.left, width: pill.width }}
            />
          ) : null}
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={item.id === "home" ? "/" : `/#${item.id}`}
              data-view={item.id}
              aria-current={current === item.id ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.id)
              }}
              className={cn(
                "relative rounded-full px-5 py-2 text-[0.92rem] font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                current === item.id ? "text-[var(--gold)]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <Link href="/dashboard" className={`${cta} inline-flex`}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline"
              >
                Log in
              </Link>
              <Link href="/signup" className={`${cta} hidden whitespace-nowrap sm:inline-flex`}>
                Sign up
              </Link>
            </>
          )}
          <SiteMenu signedIn={signedIn} current={current} onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  )
}
