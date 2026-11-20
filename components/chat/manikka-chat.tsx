"use client"

import { useEffect, useReducer, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ManikkaSendError,
  canSend,
  chatReducer,
  initialChatState,
  newMessageId,
  sendMessageToManikka,
  type ChatMessage,
} from "@/lib/manikka-chat"
import { ChatInput } from "./chat-input"
import { ManikkaAvatar } from "./manikka-avatar"
import { MessageBubble } from "./message-bubble"
import { ChatEmptyState } from "./suggested-prompts"
import { TypingIndicator } from "./typing-indicator"

export const CHAT_CLOSED_KEY = "manikka-chat-closed"

type ManikkaChatProps = {
  /** "page" is the full-screen /chat route. "panel" is the floating launcher panel. */
  variant?: "page" | "panel"
  /** Panel only: called when the person closes the chat. */
  onClose?: () => void
  /** Panel only: true while the panel is visible. Focus moves to the input when it opens. */
  active?: boolean
}

export function ManikkaChat({ variant = "page", onClose, active = true }: ManikkaChatProps) {
  const panel = variant === "panel"
  const router = useRouter()
  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const [draft, setDraft] = useState("")
  const headingRef = useRef<HTMLHeadingElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(true)

  const waiting = state.status === "waiting"

  useEffect(() => {
    mounted.current = true
    if (!panel) headingRef.current?.focus()
    return () => {
      mounted.current = false
    }
  }, [panel])

  useEffect(() => {
    if (panel && active) inputRef.current?.focus({ preventScroll: true })
  }, [panel, active])

  useEffect(() => {
    if (!state.messages.length && !waiting) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    endRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" })
  }, [state.messages.length, waiting, state.status])

  const requestReply = async (history: ChatMessage[]) => {
    try {
      const reply = await sendMessageToManikka(history)
      if (mounted.current) dispatch({ type: "reply", message: reply })
    } catch (error) {
      if (!mounted.current) return
      dispatch({
        type: "fail",
        error:
          error instanceof ManikkaSendError
            ? error.message
            : "Manikka couldn’t reply. Check your connection and try again.",
      })
    }
  }

  const send = (content: string) => {
    if (!canSend(content, state.status)) return
    const message: ChatMessage = {
      id: newMessageId(),
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: "send", message })
    setDraft("")
    inputRef.current?.focus()
    void requestReply([...state.messages, message])
  }

  const retry = () => {
    dispatch({ type: "retry" })
    void requestReply(state.messages)
  }

  const close = () => {
    if (panel) {
      onClose?.()
      return
    }
    sessionStorage.setItem(CHAT_CLOSED_KEY, "1")
  }

  return (
    <div
      className={cn("flex flex-col bg-background", panel ? "h-full" : "h-dvh")}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !draft) {
          close()
          if (!panel) router.push("/dashboard")
        }
      }}
    >
      <header className={cn("z-10 border-b border-border/80 bg-background/95 backdrop-blur-md", panel ? "shrink-0" : "sticky top-0")}>
        <div className={cn("mx-auto flex w-full items-center gap-4 px-4", panel ? "h-[4.5rem]" : "h-20 max-w-2xl")}>
          {panel ? null : (
            <Button asChild variant="ghost" size="icon-lg" className="size-10">
              <Link href="/dashboard" onClick={close} aria-label="Close chat and go back to your dashboard">
                <ArrowLeft aria-hidden="true" />
              </Link>
            </Button>
          )}
          <ManikkaAvatar />
          <div className="min-w-0 flex-1">
            <h1 ref={headingRef} tabIndex={-1} className="font-heading text-lg leading-tight outline-none">
              Manikka
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />
              {waiting ? "Typing…" : "Your money assistant"}
            </p>
          </div>
          {panel ? (
            <Button type="button" variant="ghost" size="icon" className="size-10 rounded-full" onClick={close} aria-label="Close chat">
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={cn("mx-auto w-full px-4 py-6", panel ? "" : "max-w-2xl py-8")}>
          {state.messages.length ? null : <ChatEmptyState onPick={send} disabled={waiting} />}
          <ol role="log" aria-live="polite" aria-label="Conversation with Manikka" className="space-y-6">
            {state.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {waiting ? <TypingIndicator /> : null}
          </ol>
          {state.status === "error" ? (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-destructive/10 px-4 py-4 text-sm text-destructive"
            >
              <span>{state.error}</span>
              <Button type="button" size="sm" variant="outline" onClick={retry}>
                <RotateCcw aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border/80 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className={cn("mx-auto w-full px-4 pt-4", panel ? "" : "max-w-2xl")}>
          <ChatInput
            inputRef={inputRef}
            value={draft}
            onChange={setDraft}
            onSend={() => send(draft)}
            canSend={canSend(draft, state.status)}
            waiting={waiting}
          />
        </div>
      </div>
    </div>
  )
}
