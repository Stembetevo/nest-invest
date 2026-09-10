"use client"

import { useEffect, useState } from "react"
import { formatCountdown } from "@/lib/dates"

export function Countdown({ closesAt }: { closesAt: string }) {
  const [label, setLabel] = useState("—")

  useEffect(() => {
    const tick = () => {
      setLabel(formatCountdown(new Date(closesAt).getTime() - Date.now()))
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [closesAt])

  return <span>{label}</span>
}
