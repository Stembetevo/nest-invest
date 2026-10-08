import type { ReactNode } from "react"
import { FormAlert } from "@/components/form-alert"
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED } from "@/lib/supabase/env"

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="font-heading mt-1 text-3xl tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {isSupabaseConfigured() ? null : <FormAlert tone="error">{SUPABASE_NOT_CONFIGURED}</FormAlert>}
      <div className="rounded-3xl bg-card px-5 py-6 ring-1 ring-foreground/10">{children}</div>
      {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  )
}
