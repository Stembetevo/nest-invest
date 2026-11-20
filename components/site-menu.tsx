"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NAV_LINKS, type LandingView } from "@/components/nav-links"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/** Mobile navigation drawer. Desktop links live in SiteHeader. */
export function SiteMenu({
  signedIn,
  current,
  onNavigate,
}: {
  signedIn: boolean
  current: LandingView
  onNavigate: (view: LandingView) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="size-11 md:hidden" aria-label="Open menu">
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Manikka</SheetTitle>
          <SheetDescription>Track income. Prove it. Unlock credit.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Sections" className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((item) => (
            <SheetClose asChild key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={current === item.id ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-3 text-left text-base transition-colors hover:bg-muted",
                  current === item.id && "bg-[var(--gold)]/12 text-[var(--gold)]"
                )}
              >
                {item.label}
              </button>
            </SheetClose>
          ))}
        </nav>
        <SheetFooter>
          {signedIn ? (
            <>
              <Button asChild className="h-12 text-base">
                <SheetClose asChild>
                  <Link href="/dashboard">Open dashboard</Link>
                </SheetClose>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="outline" className="h-12 w-full text-base">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild className="h-12 text-base">
                <SheetClose asChild>
                  <Link href="/signup">Sign up</Link>
                </SheetClose>
              </Button>
              <Button asChild variant="outline" className="h-12 text-base">
                <SheetClose asChild>
                  <Link href="/login">Log in</Link>
                </SheetClose>
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
