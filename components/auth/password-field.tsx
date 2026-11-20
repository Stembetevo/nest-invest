"use client"

import { useState, type ComponentProps } from "react"
import { Eye, EyeOff } from "lucide-react"
import { FieldError } from "@/components/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  id: string
  label: string
  error?: string
  hint?: string
  showStrength?: boolean
}

function strength(value: string) {
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++
  return score
}

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"]

export function PasswordField({ id, label, error, hint, showStrength, ...props }: Props) {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState("")
  const score = value ? strength(value) : 0
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-12 pr-12 text-base"
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>
      {showStrength && value ? (
        <div aria-live="polite" className="space-y-1.5">
          <div className="flex gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= score ? (score <= 1 ? "bg-destructive" : "bg-[var(--gold)]") : "bg-muted"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Strength: {LABELS[score]}</p>
        </div>
      ) : null}
      {hint ? <p id={hintId} className="text-xs text-muted-foreground">{hint}</p> : null}
      <FieldError id={errorId} message={error} />
    </div>
  )
}
