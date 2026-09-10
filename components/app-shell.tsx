"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, Landmark, Wallet } from "lucide-react"
import { NestWordmark } from "@/components/nest-mark"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/how-it-works", label: "How it works", icon: Landmark },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <Link href="/" aria-label="nest home">
            <NestWordmark />
          </Link>
          <p className="hidden text-right text-xs text-muted-foreground sm:block">
            M-Pesa for Treasury Bills
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 sm:pt-8">
        {children}
        <p className="mt-10 text-center text-[11px] leading-relaxed text-muted-foreground">
          Demo only. Not a CMA-licensed offer and not a Central Bank of Kenya product. M-Pesa and
          DhowCSD are simulated. We don’t take risk — we route.
        </p>
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-4 px-2 pt-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
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
    </div>
  )
}
