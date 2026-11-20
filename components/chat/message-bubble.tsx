import { formatTime } from "@/lib/dates"
import type { ChatMessage } from "@/lib/manikka-chat"
import { cn } from "@/lib/utils"
import { ManikkaAvatar } from "./manikka-avatar"

export function MessageBubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "user"
  return (
    <li className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {mine ? null : <ManikkaAvatar className="size-8 [&_svg]:size-4" />}
      <div className={cn("flex max-w-[82%] flex-col gap-1.5", mine ? "items-end" : "items-start")}>
        <span className="sr-only">{mine ? "You said:" : "Manikka said:"}</span>
        <p
          className={cn(
            "rounded-3xl px-5 py-3.5 text-[0.95rem] leading-relaxed break-words whitespace-pre-wrap",
            mine
              ? "rounded-br-lg bg-primary text-primary-foreground"
              : "rounded-bl-lg surface text-card-foreground"
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
