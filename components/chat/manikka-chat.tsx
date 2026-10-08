"use client"

import { useEffect, useReducer, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export function ManikkaChat() {
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
    headingRef.current?.focus()
    return () => {
      mounted.current = false
    }
  }, [])

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
    sessionStorage.setItem(CHAT_CLOSED_KEY, "1")
  }

  return (
    <div
      className="flex h-dvh flex-col bg-background"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !draft) {
          close()
          router.push("/dashboard")
        }
      }}
    >
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center gap-3 px-3">
          <Button asChild variant="ghost" size="icon-lg" className="size-10">
            <Link href="/dashboard" onClick={close} aria-label="Close chat and go back to your dashboard">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <ManikkaAvatar />
          <div className="min-w-0">
            <h1 ref={headingRef} tabIndex={-1} className="font-heading text-lg leading-tight outline-none">
              Manikka
            </h1>
            <p className="text-xs text-muted-foreground">{waiting ? "Typing…" : "Your money assistant"}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-3 py-4">
          {state.messages.length ? null : <ChatEmptyState onPick={send} disabled={waiting} />}
          <ol role="log" aria-live="polite" aria-label="Conversation with Manikka" className="space-y-4">
            {state.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {waiting ? <TypingIndicator /> : null}
          </ol>
          {state.status === "error" ? (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-destructive/10 px-3 py-3 text-sm text-destructive"
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

      <div className="border-t border-border/80 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto w-full max-w-2xl px-3 pt-3">
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
