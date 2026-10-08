import type { ComponentProps } from "react"
import { Check } from "lucide-react"

type ChoiceChipProps = Omit<ComponentProps<"input">, "type"> & {
  type: "radio" | "checkbox"
  label: string
}

export function ChoiceChip({ label, type, ...props }: ChoiceChipProps) {
  return (
    <label className="relative cursor-pointer">
      <input type={type} className="peer sr-only" {...props} />
      <span className="flex h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-medium ring-1 ring-foreground/15 transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:ring-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 [&>svg]:hidden peer-checked:[&>svg]:block">
        <Check className="size-4" aria-hidden="true" />
        {label}
      </span>
    </label>
  )
}
