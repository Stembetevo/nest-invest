"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { ManikkaWordmark } from "@/components/manikka-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isValidKenyanPhone } from "@/lib/money"
import { signIn, useHydrated, useManikkaStore } from "@/lib/store"

export default function SignInPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const session = useManikkaStore()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (hydrated && session.signedInAt) router.replace("/dashboard")
  }, [hydrated, session.signedInAt, router])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError("Enter the name lenders should see on the report.")
      return
    }
    if (!isValidKenyanPhone(phone)) {
      setError("Use a Safaricom number, like 0712 345 678.")
      return
    }
    signIn({ name: trimmed, phone })
    router.push("/dashboard")
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Link href="/" aria-label="Manikka home">
            <ManikkaWordmark />
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-md flex-col px-5 py-16">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
          Your report
        </p>
        <h1 className="font-heading mt-3 text-4xl tracking-tight">Get started</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          One profile on this device. Sign in with the same M-Pesa number to reopen a report you
          already built.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11"
              placeholder="Amina Kariuki"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">M-Pesa number</Label>
            <Input
              id="phone"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-11"
              placeholder="0712 345 678"
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="h-12 w-full text-base">
            Continue
          </Button>
        </form>
        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          Demo only. Nothing is sent to Safaricom. The statement read on the next screen is
          simulated on this device.
        </p>
      </main>
    </div>
  )
}
