"use client"

import { useEffect } from "react"
import { CHAT_CLOSED_KEY } from "./manikka-chat"

/** Returns focus to the control that opened the chat after the user closes it. */
export function FocusOnChatClose({ targetId }: { targetId: string }) {
  useEffect(() => {
    if (sessionStorage.getItem(CHAT_CLOSED_KEY) !== "1") return
    sessionStorage.removeItem(CHAT_CLOSED_KEY)
    document.getElementById(targetId)?.focus()
  }, [targetId])
  return null
}
