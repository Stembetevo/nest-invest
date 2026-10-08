"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, Landmark, LogOut, Wallet } from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { NestWordmark } from "@/components/nest-mark"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/how-it-works", label: "How it works", icon: Landmark },
]

const CREATOR_ROUTES = ["/dashboard", "/income"]
const FOCUSED_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/onboarding"]
const FULL_SCREEN_ROUTES = ["/chat"]

function inRoutes(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (inRoutes(pathname, FULL_SCREEN_ROUTES)) return <>{children}</>

  const creator = inRoutes(pathname, CREATOR_ROUTES)
  const focused = inRoutes(pathname, FOCUSED_ROUTES)
  const nest = !creator && !focused

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <Link href={creator ? "/dashboard" : "/"} aria-label={creator ? "Income home" : "nest home"}>
            <NestWordmark />
          </Link>
          {creator ? (
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          ) : nest ? (
            <div className="flex items-center gap-3">
              <p className="hidden text-right text-xs text-muted-foreground sm:block">
                M-Pesa for Treasury Bills
              </p>
              <Link
                href="/dashboard"
                className="rounded-lg px-2 py-1.5 text-sm font-medium text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Creator income
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-3xl flex-1 px-4 pt-5 sm:pt-8",
          nest ? "pb-28" : "pb-12"
        )}
      >
        {children}
        {nest ? (
          <p className="mt-10 text-center text-[11px] leading-relaxed text-muted-foreground">
            Demo only. Not a CMA-licensed offer and not a Central Bank of Kenya product. M-Pesa and
            DhowCSD are simulated. We don’t take risk — we route.
          </p>
        ) : null}
      </main>

      {nest ? (
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md"
        >
          <div className="mx-auto grid max-w-3xl grid-cols-4 px-2 pt-1">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("size-5", active && "fill-primary/10")} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
