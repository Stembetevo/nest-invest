"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MpesaStkSheet } from "@/components/mpesa-stk"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuction, resolvePledgeStatus } from "@/lib/auctions"
import { formatDateTime } from "@/lib/dates"
import {
  MIN_PLEDGE_KES,
  PLEDGE_PRESETS,
  calcReturns,
  formatKes,
  formatRate,
  isValidKenyanPhone,
  normalizeKenyanPhone,
} from "@/lib/money"
import { addPledge, makeReceiptCode, useNestStore } from "@/lib/store"
import type { Auction } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PledgeForm({ auction }: { auction: Auction }) {
  const router = useRouter()
  const { phone: savedPhone } = useNestStore()
  const [amountInput, setAmountInput] = useState("100")
  const [phone, setPhone] = useState("")
  const [stkOpen, setStkOpen] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [amountError, setAmountError] = useState("")
  const phoneValue = phone || savedPhone

  const amount = Number(amountInput)
  const validAmount = Number.isFinite(amount) && amount >= MIN_PLEDGE_KES
  const returns = useMemo(
    () => calcReturns(validAmount ? amount : 0, auction.annualRate, auction.tenorDays),
    [amount, auction.annualRate, auction.tenorDays, validAmount]
  )

  const closed = auction.status !== "open"

  const startStk = () => {
    setPhoneError("")
    setAmountError("")
    if (closed) return
    if (!validAmount) {
      setAmountError(`Minimum pledge is ${formatKes(MIN_PLEDGE_KES, 0)}.`)
      return
    }
    if (!isValidKenyanPhone(phoneValue)) {
      setPhoneError("Enter a Kenyan M-Pesa number, e.g. 0712 345 678.")
      return
    }
    setStkOpen(true)
  }

  const completePledge = () => {
    const normalized = normalizeKenyanPhone(phoneValue)
    const liveAuction = getAuction(auction.id) ?? auction
    addPledge({
      id: crypto.randomUUID(),
      auctionId: auction.id,
      tenorDays: auction.tenorDays,
      amount,
      annualRate: auction.annualRate,
      interest: returns.interest,
      nestFee: returns.nestFee,
      youEarn: returns.youEarn,
      phone: normalized,
      createdAt: new Date().toISOString(),
      status: resolvePledgeStatus(liveAuction),
      payoutDate: liveAuction.maturityDate,
      receiptCode: makeReceiptCode(),
    })
    toast.success("Pledge routed to this week’s T-bill auction.")
    setStkOpen(false)
    router.push("/portfolio")
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 pt-1">
          <div>
            <Label htmlFor="amount">Amount to pledge</Label>
            <p className="mb-2 mt-1 text-xs text-muted-foreground">Tap 1 of 3 — choose KSh 100 or more.</p>
            <div className="grid grid-cols-4 gap-2">
              {PLEDGE_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? "default" : "outline"}
                  className="h-10"
                  onClick={() => {
                    setAmountInput(String(preset))
                    setAmountError("")
                  }}
                >
                  {formatKes(preset, 0)}
                </Button>
              ))}
            </div>
            <Input
              id="amount"
              inputMode="numeric"
              className="mt-3 h-12 text-lg"
              value={amountInput}
              onChange={(event) => {
                setAmountInput(event.target.value.replace(/[^\d]/g, ""))
                setAmountError("")
              }}
              aria-invalid={Boolean(amountError)}
            />
            {amountError ? (
              <p className="mt-1.5 text-sm text-destructive">{amountError}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="phone">M-Pesa number</Label>
            <Input
              id="phone"
              className="mt-1.5 h-12"
              placeholder="0712 345 678"
              value={phoneValue}
              onChange={(event) => {
                setPhone(event.target.value)
                setPhoneError("")
              }}
              aria-invalid={Boolean(phoneError)}
            />
            {phoneError ? (
              <p className="mt-1.5 text-sm text-destructive">{phoneError}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-1 text-sm">
          <Breakdown label="Expected interest" value={formatKes(returns.interest)} />
          <Breakdown label="nest fee (1% of interest)" value={formatKes(returns.nestFee)} muted />
          <Breakdown label="You earn" value={formatKes(returns.youEarn)} emphasize />
          <Breakdown label="Back at maturity" value={formatKes(returns.payout)} />
          <p className="pt-2 text-xs text-muted-foreground">
            {formatRate(auction.annualRate)} annualised, pro-rated over {auction.tenorDays} days /
            365. Auction closes {formatDateTime(auction.closesAt)}.
          </p>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className={cn("h-12 w-full text-base")}
        disabled={closed}
        onClick={startStk}
      >
        {closed ? "Auction closed" : "Pledge with M-Pesa"}
      </Button>

      <MpesaStkSheet
        open={stkOpen}
        auction={auction}
        amount={validAmount ? amount : 0}
        phone={phoneValue}
        youEarn={returns.youEarn}
        nestFee={returns.nestFee}
        onOpenChange={setStkOpen}
        onCancel={() => toast.message("STK cancelled. No money moved.")}
        onSuccess={completePledge}
      />
    </div>
  )
}

function Breakdown({
  label,
  value,
  muted,
  emphasize,
}: {
  label: string
  value: string
  muted?: boolean
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={emphasize ? "font-heading text-lg" : "font-medium"}>{value}</span>
    </div>
  )
}
