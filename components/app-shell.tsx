"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, ReceiptText } from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { ChatLauncherProvider } from "@/components/chat/chat-launcher"
import { ManikkaWordmark } from "@/components/manikka-mark"
import { cn } from "@/lib/utils"

<<<<<<< HEAD
const APP_ROUTES = ["/dashboard", "/income"]
const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: ReceiptText },
]
=======
const CREATOR_ROUTES = ["/dashboard", "/onboarding"]
>>>>>>> 60312ee4137d9795bcbd5d6d2105e910b070e91f

const matches = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`)

function SignOutButton({ className, label = true }: { className?: string; label?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label="Sign out"
        className={cn("flex items-center gap-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none", className)}
      >
        <LogOut className="size-5" aria-hidden="true" />
        {label ? "Sign out" : null}
      </button>
    </form>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Onboarding: focused layout, no navigation.
  if (matches(pathname, "/onboarding")) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="border-b border-white/10">
          <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
            <Link href="/dashboard" aria-label="Manikka home"><ManikkaWordmark /></Link>
            <SignOutButton label className="px-2 py-1.5" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">{children}</main>
      </div>
    )
  }
  if (!APP_ROUTES.some((r) => matches(pathname, r))) return children

  return (
    <ChatLauncherProvider>
      <div className="min-h-dvh lg:pl-72">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-sidebar px-5 py-8 lg:flex">
          <Link href="/dashboard" aria-label="Manikka home" className="px-2"><ManikkaWordmark /></Link>
          <nav aria-label="App" className="mt-10 flex flex-1 flex-col gap-2">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = matches(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-12 items-center gap-3.5 rounded-xl px-4 text-[0.95rem] font-medium transition-all duration-200",
                    active ? "bg-[var(--gold)]/15 text-[var(--gold)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn("absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--gold)] transition-all duration-300", active ? "opacity-100" : "h-2 opacity-0")}
                  />
                  <Icon className="size-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-4">
            <SignOutButton className="h-12 w-full px-4 hover:bg-white/5" />
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-background/85 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/dashboard" aria-label="Manikka home"><ManikkaWordmark /></Link>
            <SignOutButton label={false} className="size-11 justify-center" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[92rem] px-5 py-8 pb-40 sm:px-8 lg:px-12 lg:py-7 lg:pb-7 2xl:px-16">
          <div key={pathname} className="page-enter">{children}</div>
        </main>

        {/* Mobile tab bar */}
        <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = matches(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors", active ? "text-[var(--gold)]" : "text-muted-foreground")}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </ChatLauncherProvider>
  )
}
