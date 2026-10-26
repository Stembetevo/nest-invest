import { CircleCheck, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfileStepStatus } from "@/lib/income-stats"
import { cn } from "@/lib/utils"

export function ProfileProgressCard({ steps }: { steps: ProfileStepStatus[] }) {
  const done = steps.filter((step) => step.done).length
  const label = `${done} of ${steps.length} steps done`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Verified income profile</CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          role="progressbar"
          aria-label="Verified income profile progress"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={done}
          aria-valuetext={label}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(done / steps.length) * 100}%` }}
          />
        </div>
        <ul className="space-y-2">
          {steps.map((step) => {
            const Icon = step.done ? CircleCheck : Circle
            return (
              <li key={step.id} className="flex items-center gap-2 text-sm">
                <Icon
                  className={cn("size-4 shrink-0", step.done ? "text-primary" : "text-muted-foreground")}
                  aria-hidden="true"
                />
                <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                  {step.label}
                </span>
                <span className="sr-only">{step.done ? "(done)" : "(not done yet)"}</span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
