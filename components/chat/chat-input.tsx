"use client"

import { useLayoutEffect, type KeyboardEvent, type RefObject } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAX_MESSAGE_LENGTH } from "@/lib/manikka-chat"

export function ChatInput({
  inputRef,
  value,
  onChange,
  onSend,
  canSend,
  waiting,
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
  onSend: () => void
  canSend: boolean
  waiting: boolean
}) {
  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [inputRef, value])

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    if (canSend) onSend()
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSend()
      }}
      className="flex items-end gap-2"
    >
      <label htmlFor="manikka-message" className="sr-only">
        Message Manikka
      </label>
      <textarea
        id="manikka-message"
        ref={inputRef}
        rows={1}
        value={value}
        maxLength={MAX_MESSAGE_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Manikka about your income…"
        aria-describedby="manikka-input-hint"
        className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-card px-3.5 py-2.5 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      />
      <span id="manikka-input-hint" className="sr-only">
        Press Enter to send, Shift and Enter for a new line. Press Escape on an empty message to
        close the chat.
      </span>
      <Button
        type="submit"
        size="icon-lg"
        className="size-11 rounded-full"
        disabled={!canSend}
        aria-label={waiting ? "Waiting for Manikka" : "Send message"}
      >
        <SendHorizontal aria-hidden="true" />
      </Button>
    </form>
  )
}
