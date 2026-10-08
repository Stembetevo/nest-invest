export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export const SUGGESTED_PROMPTS = [
  "How much did I earn this month?",
  "Which source pays me the most?",
  "How does this month compare to last month?",
  "What should I track next?",
] as const

export const MANIKKA_GREETING =
  "Habari! I’m Manikka. Ask me about your income — what you earned, where it came from, and how this month is going."

export const MAX_MESSAGE_LENGTH = 1000

const CANNED_REPLIES: { match: RegExp; reply: string }[] = [
  {
    match: /earn|made|total|how much/i,
    reply:
      "Soon I’ll add up this month’s income for you straight from your entries. For now, your dashboard shows this month’s total right at the top.",
  },
  {
    match: /source|pays|most|best/i,
    reply:
      "Good question. Open the “By source” view on your dashboard chart to see which source has paid you the most over the last 6 months.",
  },
  {
    match: /compare|last month|change|growth/i,
    reply:
      "The card at the top of your dashboard compares this month with last month, in shillings and as a percentage.",
  },
  {
    match: /track|next|tip|advice/i,
    reply:
      "Log every payment the day it lands — brand deals, YouTube, M-Pesa, and client work. Income in two or more months moves you closer to a verified income profile.",
  },
]

const FALLBACK_REPLY =
  "I’m still learning, so my answers are limited for now. Try asking what you earned this month or which source pays you the most."

export class ManikkaSendError extends Error {
  constructor(message = "Manikka couldn’t reply. Check your connection and try again.") {
    super(message)
    this.name = "ManikkaSendError"
  }
}

/**
 * Sends the conversation to Manikka and resolves with the assistant's reply.
 *
 * TODO: Replace this mock with a call to the real Manikka AI backend. Keep the signature
 * (full message history in, one assistant message out, throw ManikkaSendError on failure)
 * so the chat UI does not need to change.
 *
 * Mock behaviour: replies with a canned answer after a short delay. A message containing the
 * word "fail" throws, so the error and retry states can be checked by hand.
 */
export async function sendMessageToManikka(
  messages: ChatMessage[],
  { delayMs = 900 }: { delayMs?: number } = {}
): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  const lastUser = [...messages].reverse().find((message) => message.role === "user")
  if (!lastUser) throw new ManikkaSendError("There’s no message to reply to.")
  if (/\bfail\b/i.test(lastUser.content)) throw new ManikkaSendError()

  const reply = CANNED_REPLIES.find((item) => item.match.test(lastUser.content))?.reply ?? FALLBACK_REPLY
  return {
    id: newMessageId(),
    role: "assistant",
    content: reply,
    createdAt: new Date().toISOString(),
  }
}

export function newMessageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export type ChatStatus = "idle" | "waiting" | "error"

export type ChatState = {
  messages: ChatMessage[]
  status: ChatStatus
  error: string | null
}

export type ChatAction =
  | { type: "send"; message: ChatMessage }
  | { type: "reply"; message: ChatMessage }
  | { type: "fail"; error: string }
  | { type: "retry" }

export const initialChatState: ChatState = { messages: [], status: "idle", error: null }

export function canSend(input: string, status: ChatStatus) {
  return input.trim().length > 0 && status !== "waiting"
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "send":
      if (!canSend(action.message.content, state.status)) return state
      return {
        messages: [...state.messages, { ...action.message, content: action.message.content.trim() }],
        status: "waiting",
        error: null,
      }
    case "reply":
      if (state.status !== "waiting") return state
      return { messages: [...state.messages, action.message], status: "idle", error: null }
    case "fail":
      if (state.status !== "waiting") return state
      return { ...state, status: "error", error: action.error }
    case "retry":
      if (state.status !== "error") return state
      return { ...state, status: "waiting", error: null }
  }
}
