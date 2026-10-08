import { CircleAlert, CircleCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success"
  children: React.ReactNode
}) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-2 rounded-xl px-3 py-3 text-sm",
        tone === "error" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
