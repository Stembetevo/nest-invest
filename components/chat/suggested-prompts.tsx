import { SUGGESTED_PROMPTS, MANIKKA_GREETING } from "@/lib/manikka-chat"
import { ManikkaAvatar } from "./manikka-avatar"

export function ChatEmptyState({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-5 px-2 py-8 text-center">
      <ManikkaAvatar className="size-14 [&_svg]:size-7" />
      <p className="max-w-sm text-sm leading-relaxed">{MANIKKA_GREETING}</p>
      <div className="w-full max-w-sm space-y-2">
        <p id="suggested-prompts-label" className="text-xs font-medium text-muted-foreground">
          Try asking
        </p>
        <ul aria-labelledby="suggested-prompts-label" className="space-y-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <li key={prompt}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(prompt)}
                className="w-full rounded-xl bg-card px-4 py-3 text-left text-sm font-medium ring-1 ring-foreground/15 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
              >
                {prompt}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
