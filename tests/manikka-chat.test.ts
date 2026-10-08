import { afterEach, describe, expect, it, vi } from "vitest"
import {
  ManikkaSendError,
  canSend,
  chatReducer,
  initialChatState,
  sendMessageToManikka,
  type ChatMessage,
} from "@/lib/manikka-chat"

function message(content: string, role: ChatMessage["role"] = "user"): ChatMessage {
  return { id: `${role}-${content}`, role, content, createdAt: "2026-10-08T07:00:00Z" }
}

describe("canSend", () => {
  it("blocks empty and whitespace-only messages", () => {
    expect(canSend("", "idle")).toBe(false)
    expect(canSend("   \n ", "idle")).toBe(false)
  })

  it("blocks sending while waiting for a reply", () => {
    expect(canSend("Hi", "waiting")).toBe(false)
  })

  it("allows sending when idle or after an error", () => {
    expect(canSend("Hi", "idle")).toBe(true)
    expect(canSend("Hi", "error")).toBe(true)
  })
})

describe("chatReducer", () => {
  it("ignores an empty send", () => {
    expect(chatReducer(initialChatState, { type: "send", message: message("  ") })).toBe(initialChatState)
  })

  it("adds the user message, waits, then appends the reply", () => {
    const sent = chatReducer(initialChatState, { type: "send", message: message("  Hello  ") })
    expect(sent.status).toBe("waiting")
    expect(sent.messages.map((m) => m.content)).toEqual(["Hello"])

    const replied = chatReducer(sent, { type: "reply", message: message("Habari", "assistant") })
    expect(replied.status).toBe("idle")
    expect(replied.messages.map((m) => m.role)).toEqual(["user", "assistant"])
  })

  it("keeps the user's message and shows an error when sending fails", () => {
    const sent = chatReducer(initialChatState, { type: "send", message: message("Hello") })
    const failed = chatReducer(sent, { type: "fail", error: "Couldn’t reply" })
    expect(failed.status).toBe("error")
    expect(failed.error).toBe("Couldn’t reply")
    expect(failed.messages).toHaveLength(1)
  })

  it("retries a failed send and recovers on success", () => {
    const failed = chatReducer(chatReducer(initialChatState, { type: "send", message: message("Hello") }), {
      type: "fail",
      error: "x",
    })
    const retrying = chatReducer(failed, { type: "retry" })
    expect(retrying).toMatchObject({ status: "waiting", error: null })
    const done = chatReducer(retrying, { type: "reply", message: message("Hi!", "assistant") })
    expect(done.status).toBe("idle")
    expect(done.messages).toHaveLength(2)
  })

  it("ignores retry when nothing failed and stray replies when not waiting", () => {
    expect(chatReducer(initialChatState, { type: "retry" })).toBe(initialChatState)
    expect(chatReducer(initialChatState, { type: "reply", message: message("x", "assistant") })).toBe(
      initialChatState
    )
  })
})

describe("sendMessageToManikka (mock)", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("replies after a delay", async () => {
    vi.useFakeTimers()
    const pending = sendMessageToManikka([message("How much did I earn this month?")], { delayMs: 500 })
    let settled = false
    void pending.then(() => (settled = true))
    await vi.advanceTimersByTimeAsync(499)
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    const reply = await pending
    expect(reply.role).toBe("assistant")
    expect(reply.content).toMatch(/this month/)
  })

  it("rejects with ManikkaSendError so the UI can offer a retry", async () => {
    await expect(sendMessageToManikka([message("please fail")], { delayMs: 0 })).rejects.toBeInstanceOf(
      ManikkaSendError
    )
  })
})
