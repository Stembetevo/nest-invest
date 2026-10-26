import type { Metadata } from "next"
import { ManikkaChat } from "@/components/chat/manikka-chat"
import { requireUser } from "@/lib/creator-data"

export const metadata: Metadata = { title: "Chat with Manikka" }

export default async function ChatPage() {
  await requireUser("/chat")
  return <ManikkaChat />
}
