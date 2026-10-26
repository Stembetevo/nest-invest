"use client"

import Link from "next/link"
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

const LINKS = [
  { href: "/#problem", label: "The problem" },
  { href: "/#manikka", label: "Meet Manikka" },
  { href: "/#privacy", label: "Privacy and control" },
  { href: "/#lenders", label: "For lenders" },
  { href: "/#roadmap", label: "Roadmap" },
]

export function SiteMenu() {
  const [open, setOpen] = useState(false)

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
          <SheetTitle>Manikka</SheetTitle>
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
          <Button asChild className="h-11">
            <SheetClose asChild>
              <Link href="/signup">Get started</Link>
            </SheetClose>
          </Button>
          <Button asChild variant="outline" className="h-11">
            <SheetClose asChild>
              <Link href="/login">Log in</Link>
            </SheetClose>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
