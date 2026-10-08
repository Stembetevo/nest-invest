import { ManikkaAvatar } from "./manikka-avatar"

export function TypingIndicator() {
  return (
    <li className="flex items-end gap-2">
      <ManikkaAvatar className="size-8 [&_svg]:size-4" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-card px-3.5 py-3 ring-1 ring-foreground/10">
        <span className="sr-only">Manikka is typing…</span>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            aria-hidden="true"
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </li>
  )
}
