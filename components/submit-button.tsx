import type { ComponentProps } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pending: boolean
  pendingLabel: string
}

export function SubmitButton({
  pending,
  pendingLabel,
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      className={cn("h-11 w-full text-base", className)}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
