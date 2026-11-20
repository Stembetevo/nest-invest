import { Landmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ComingSoonCard({ className }: { className?: string }) {
  return (
    <section
      aria-label="Coming soon"
      className={cn(
        "flex items-center gap-4 rounded-3xl border border-dashed border-foreground/20 bg-muted/30 px-6 py-6 text-muted-foreground select-none",
        className
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/5">
        <Landmark className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <Badge variant="outline" className="text-muted-foreground">
          Coming soon
        </Badge>
        <p className="text-sm">Credit powered by stablecoin liquidity.</p>
      </div>
    </section>
  )
}
