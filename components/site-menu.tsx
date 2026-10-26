"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { signOut, useVeritasStore } from "@/lib/store"

const LINKS = [
  { href: "/#problem", label: "The problem" },
  { href: "/#product", label: "The product" },
  { href: "/#proof", label: "The report" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "Questions" },
]

export function SiteMenu() {
  const router = useRouter()
  const session = useVeritasStore()
  const signedIn = Boolean(session.signedInAt)
  const [open, setOpen] = useState(false)

  const leave = () => {
    signOut()
    setOpen(false)
    router.push("/")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-9 border-white/15 bg-transparent px-3 text-foreground hover:bg-white/5"
        >
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Veritas</SheetTitle>
          <SheetDescription>Income proof for credit.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Sections" className="flex flex-col gap-1 px-4">
          {LINKS.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="rounded-lg px-2 py-2 text-base text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <SheetFooter>
          {signedIn ? (
            <>
              <Button asChild className="h-11">
                <SheetClose asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </SheetClose>
              </Button>
              <Button variant="outline" className="h-11" onClick={leave}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="h-11">
                <SheetClose asChild>
                  <Link href="/sign-in">Get started</Link>
                </SheetClose>
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
