import { Landmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ComingSoonCard() {
  return (
    <section
      aria-label="Coming soon"
      className="flex items-start gap-3 rounded-2xl border border-dashed border-foreground/20 bg-muted/40 px-4 py-4 text-muted-foreground select-none"
    >
      <Landmark className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1.5">
        <Badge variant="outline" className="text-muted-foreground">
          Coming soon
        </Badge>
        <p className="text-sm">Credit powered by stablecoin liquidity.</p>
      </div>
    </section>
  )
}
