import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function ManikkaAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "hero-panel inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--gold)]",
        className
      )}
    >
      <Sparkles className="size-5" />
    </span>
  )
}
