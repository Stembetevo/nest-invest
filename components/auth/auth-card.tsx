import type { ReactNode } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { FormAlert } from "@/components/form-alert"
import { ManikkaWordmark } from "@/components/manikka-mark"
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED } from "@/lib/supabase/env"

const POINTS = [
  "Track every payer in one dashboard",
  "Build a verified income score",
  "Share a report with a lender only when you choose",
]

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link href="/" aria-label="Manikka home" className="w-fit">
          <ManikkaWordmark />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center space-y-8 py-14">
          <div>
            <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">{title}</h1>
            {description ? <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p> : null}
          </div>
          {isSupabaseConfigured() ? null : <FormAlert tone="error">{SUPABASE_NOT_CONFIGURED}</FormAlert>}
          <div className="surface rounded-3xl px-6 py-8 sm:px-8">{children}</div>
          {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
        <p className="text-center text-xs text-muted-foreground">Manikka never sees your M-Pesa PIN.</p>
      </div>

      <aside className="hero-panel hidden flex-col justify-center gap-10 px-16 xl:px-24 lg:flex" aria-label="Why Manikka">
        <h2 className="font-heading max-w-md text-5xl tracking-tight">
          Prove what you earn. Unlock the credit you’ve earned.
        </h2>
        <ul className="space-y-5">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 text-muted-foreground">
              <Check className="mt-1 size-4 shrink-0 text-[var(--gold)]" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
        <figure className="max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6">
          <blockquote className="font-heading text-lg leading-relaxed">
            “My till sales finally counted. The lender read one page instead of asking for a payslip I never had.”
          </blockquote>
          <figcaption className="mt-3 text-xs text-muted-foreground">Amina K., shop owner, Nairobi (sample)</figcaption>
        </figure>
      </aside>
    </div>
  )
}
