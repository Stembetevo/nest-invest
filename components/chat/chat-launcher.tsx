"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { MessageCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ManikkaChat } from "./manikka-chat"

type ChatLauncherContext = {
  open: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
}

const Ctx = createContext<ChatLauncherContext | null>(null)

/** Open or close the floating Manikka chat from anywhere inside the app shell. */
export function useChatLauncher() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useChatLauncher must be used inside <ChatLauncherProvider>")
  return ctx
}

export function ChatLauncherProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const returnFocusTo = useRef<HTMLElement | null>(null)

  const openChat = useCallback(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && active !== document.body) returnFocusTo.current = active
    setEverOpened(true)
    setOpen(true)
  }, [])

  const closeChat = useCallback(() => {
    setOpen(false)
    const target = returnFocusTo.current
    returnFocusTo.current = null
    // Wait a frame so the panel is inert before focus moves back out of it.
    if (target?.isConnected) requestAnimationFrame(() => target.focus({ preventScroll: true }))
  }, [])

  const toggleChat = useCallback(() => (open ? closeChat() : openChat()), [open, openChat, closeChat])

  const value = useMemo(
    () => ({ open, openChat, closeChat, toggleChat }),
    [open, openChat, closeChat, toggleChat]
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <ChatLauncher open={open} everOpened={everOpened} />
    </Ctx.Provider>
  )
}

/**
 * Floating chat button pinned to the bottom-left, with the conversation panel that opens above it.
 * The chat stays mounted after the first open so the conversation survives closing the panel.
 */
function ChatLauncher({ open, everOpened }: { open: boolean; everOpened: boolean }) {
  const { toggleChat, closeChat } = useChatLauncher()
  const [nudge, setNudge] = useState(true)

  // Lock page scroll behind the full-screen panel on small screens.
  useEffect(() => {
    if (!open) return
    const small = window.matchMedia("(max-width: 639px)")
    if (!small.matches) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <div
        id="manikka-chat-panel"
        role="dialog"
        aria-label="Chat with Manikka"
        aria-modal="false"
        inert={!open}
        className={cn(
          "fixed z-[60] flex flex-col overflow-hidden border border-white/12 bg-background shadow-[0_40px_80px_-30px_oklch(0.05_0.03_258/0.95)]",
          // Phones: full screen. Larger screens: floating card above the button.
          "inset-0 rounded-none sm:inset-auto sm:bottom-24 sm:right-4 sm:h-[min(40rem,calc(100dvh-8rem))] sm:w-[26rem] sm:rounded-[1.75rem] lg:right-6",
          "origin-bottom-right transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-4 scale-95 opacity-0"
        )}
      >
        {everOpened ? <ManikkaChat variant="panel" active={open} onClose={closeChat} /> : null}
      </div>

      <button
        type="button"
        id="manikka-chat-launcher"
        onClick={() => {
          setNudge(false)
          toggleChat()
        }}
        aria-expanded={open}
        aria-controls="manikka-chat-panel"
        aria-label={open ? "Close chat with Manikka" : "Ask Manikka"}
        className={cn(
          "group fixed bottom-[5.25rem] right-4 z-[61] inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-[var(--gold)] text-primary-foreground",
          "shadow-[0_18px_36px_-14px_var(--gold)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-12px_var(--gold)] active:translate-y-0 active:scale-95",
          "focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
          "lg:right-6 lg:bottom-6",
          // Icon-only on phones while the panel covers the screen; labelled pill elsewhere.
          open ? "max-sm:hidden" : "",
          "w-14 sm:w-auto sm:px-6"
        )}
      >
        {nudge && !open ? (
          <span aria-hidden="true" className="ping-soft absolute inset-0 rounded-full bg-[var(--gold)]" />
        ) : null}
        <span className="relative grid size-6 place-items-center">
          <MessageCircle
            aria-hidden="true"
            className={cn("absolute size-6 transition-all duration-300", open ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")}
          />
          <X
            aria-hidden="true"
            className={cn("absolute size-6 transition-all duration-300", open ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0")}
          />
        </span>
        <span className="relative hidden text-[0.95rem] font-semibold sm:inline">{open ? "Close" : "Ask Manikka"}</span>
      </button>
    </>
  )
}

/** Drop-in button for anywhere on a page that should open the chat. */
export function OpenChatButton({
  className,
  children,
  id,
}: {
  className?: string
  children: ReactNode
  id?: string
}) {
  const { openChat } = useChatLauncher()
  return (
    <button type="button" id={id} onClick={openChat} className={className}>
      {children}
    </button>
  )
}
