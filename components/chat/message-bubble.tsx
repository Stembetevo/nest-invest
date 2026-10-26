import { formatTime } from "@/lib/dates"
import type { ChatMessage } from "@/lib/manikka-chat"
import { cn } from "@/lib/utils"
import { ManikkaAvatar } from "./manikka-avatar"

export function MessageBubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "user"
  return (
    <li className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {mine ? null : <ManikkaAvatar className="size-8 [&_svg]:size-4" />}
      <div className={cn("flex max-w-[80%] flex-col gap-1", mine ? "items-end" : "items-start")}>
        <span className="sr-only">{mine ? "You said:" : "Manikka said:"}</span>
        <p
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
            mine
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-card text-card-foreground ring-1 ring-foreground/10"
          )}
        >
          {message.content}
        </p>
        <time dateTime={message.createdAt} className="px-1 text-[11px] text-muted-foreground">
          {formatTime(message.createdAt)}
        </time>
      </div>
    </li>
  )
}
