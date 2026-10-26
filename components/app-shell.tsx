"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/app/auth/actions"
import { ManikkaWordmark } from "@/components/manikka-mark"

const CREATOR_ROUTES = ["/dashboard", "/income", "/onboarding"]

function inRoutes(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (!inRoutes(pathname, CREATOR_ROUTES)) return children

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <Link href="/dashboard" aria-label="Manikka home">
            <ManikkaWordmark />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    </div>
  )
}
