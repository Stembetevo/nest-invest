"use client"

import { useMemo, useRef, useState } from "react"
import { Loader2, Smartphone, X } from "lucide-react"
import { NestMark } from "@/components/nest-mark"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { displayPhone, formatKes, formatRate, formatTenor } from "@/lib/money"
import type { Auction } from "@/lib/types"

type Step = "confirm" | "pin" | "processing" | "success" | "error"

const FAIL_PIN = "0000"

export function MpesaStkSheet({
  open,
  auction,
  amount,
  phone,
  youEarn,
  nestFee,
  onOpenChange,
  onCancel,
  onSuccess,
}: {
  open: boolean
  auction: Auction
  amount: number
  phone: string
  youEarn: number
  nestFee: number
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onSuccess: (pinOk: true) => void
}) {
  const [step, setStep] = useState<Step>("confirm")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const completedRef = useRef(false)

  const reset = () => {
    setStep("confirm")
    setPin("")
    setError("")
    completedRef.current = false
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (!completedRef.current) onCancel()
      reset()
    }
    onOpenChange(next)
  }

  const pressDigit = (digit: string) => {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    setError("")
    if (next.length === 4) {
      submitPin(next)
    }
  }

  const submitPin = (value: string) => {
    if (value === FAIL_PIN) {
      setError("Wrong PIN. Try again — use any PIN except 0000 in this demo.")
      setPin("")
      setStep("pin")
      return
    }
    setStep("processing")
    window.setTimeout(() => {
      completedRef.current = true
      setStep("success")
      onSuccess(true)
    }, 1100)
  }

  const title = useMemo(() => {
    if (step === "confirm") return "Confirm M-Pesa pledge"
    if (step === "pin") return "Enter M-Pesa PIN"
    if (step === "processing") return "Sending STK push"
    if (step === "success") return "Pledge received"
    return "Could not complete"
  }, [step])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="z-[80] mx-auto max-h-[92dvh] w-full max-w-lg rounded-t-3xl border-x border-t p-0"
      >
        <div className="stk-sheet px-5 pb-6 pt-3">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-primary-foreground/25" />
          <SheetHeader className="gap-1 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-foreground">
                <NestMark className="size-8 text-primary-foreground" />
                <span className="text-xs font-semibold tracking-[0.18em] uppercase">
                  STK push · demo
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => handleOpenChange(false)}
                aria-label="Cancel STK"
              >
                <X />
              </Button>
            </div>
            <SheetTitle className="font-heading text-2xl text-primary-foreground">
              {title}
            </SheetTitle>
            <SheetDescription className="text-primary-foreground/75">
              {displayPhone(phone)} · nest Bills · {formatTenor(auction.tenorDays)} at{" "}
              {formatRate(auction.annualRate)}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 rounded-2xl bg-primary-foreground p-4 text-foreground shadow-sm">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-muted-foreground">
              Amount
            </p>
            <p className="font-heading text-4xl tracking-tight">{formatKes(amount, 0)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">You earn</p>
                <p className="font-medium">{formatKes(youEarn)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">nest fee (1% of interest)</p>
                <p className="font-medium">{formatKes(nestFee)}</p>
              </div>
            </div>
          </div>

          {step === "confirm" ? (
            <div className="mt-5 space-y-3">
              <p className="text-sm text-primary-foreground/80">
                Tap 2 of 3 — confirm this STK on your phone. nest routes the pledge; we do not
                hold your principal as our own book.
              </p>
              <Button
                size="lg"
                className="h-12 w-full bg-[var(--gold)] text-base text-primary hover:bg-[var(--gold)]/90"
                onClick={() => setStep("pin")}
              >
                <Smartphone /> Confirm on M-Pesa
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-11 w-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          ) : null}

          {step === "pin" || step === "error" ? (
            <div className="mt-5">
              <p className="text-sm text-primary-foreground/80">
                Tap 3 of 3 — enter a 4-digit PIN. Any PIN works except 0000, which fails so you
                can try the error path.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className="flex size-4 items-center justify-center rounded-full border border-primary-foreground/40"
                  >
                    {pin.length > index ? (
                      <span className="size-2.5 rounded-full bg-[var(--gold)]" />
                    ) : null}
                  </span>
                ))}
              </div>
              {error ? (
                <p className="mt-3 text-center text-sm text-[var(--gold)]" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "C"].map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="secondary"
                    className="h-12 bg-primary-foreground/10 text-lg text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => {
                      if (key === "←") setPin((value) => value.slice(0, -1))
                      else if (key === "C") {
                        setPin("")
                        setError("")
                      } else pressDigit(key)
                    }}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {step === "processing" ? (
            <div className="mt-8 flex flex-col items-center gap-3 pb-6 text-primary-foreground">
              <Loader2 className="size-8 animate-spin" />
              <p>Contacting M-Pesa…</p>
            </div>
          ) : null}

          {step === "success" ? (
            <p className="mt-5 text-sm text-primary-foreground/80">
              Confirmed. Your pledge is queued for this week’s CBK auction via DhowCSD (demo).
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
