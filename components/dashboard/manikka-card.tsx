import { MessageCircle } from "lucide-react"
import { OpenChatButton } from "@/components/chat/chat-launcher"
import { FocusOnChatClose } from "@/components/chat/focus-on-chat-close"
import { ManikkaAvatar } from "@/components/chat/manikka-avatar"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ManikkaCard({ insight, className }: { insight: string; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="flex h-full flex-col gap-5">
        <div className="flex items-center gap-3.5">
          <ManikkaAvatar className="size-11" />
          <div>
            <h2 className="font-heading text-lg leading-tight">Manikka</h2>
            <p className="text-xs text-muted-foreground">Your money assistant</p>
          </div>
        </div>
        <p className="flex-1 text-[0.95rem] leading-relaxed">{insight}</p>
        <OpenChatButton id="open-manikka-chat" className={cn(buttonVariants({ size: "lg" }), "w-full cursor-pointer")}>
          <MessageCircle aria-hidden="true" />
          Ask Manikka
        </OpenChatButton>
        {/* Still used when the full-screen /chat page is closed. */}
        <FocusOnChatClose targetId="open-manikka-chat" />
      </CardContent>
    </Card>
  )
}
