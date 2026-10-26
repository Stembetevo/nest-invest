import type { Metadata } from "next"
import Link from "next/link"
import { ManikkaWordmark } from "@/components/manikka-mark"

export const metadata: Metadata = { title: "Privacy — Manikka" }

export default function PrivacyPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-5 py-10">
      <Link href="/" aria-label="Manikka home">
        <ManikkaWordmark />
      </Link>
      <h1 className="font-heading mt-10 text-4xl tracking-tight">Privacy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>You choose what is shared, with whom, and for how long. You can revoke access any time.</p>
        <p>
          Interactive prototype. App figures and conversations are examples, not offers or
          financial advice.
        </p>
      </div>
    </div>
  )
}
