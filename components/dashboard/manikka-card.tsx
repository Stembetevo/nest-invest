import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { ManikkaAvatar } from "@/components/chat/manikka-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ManikkaCard({ insight }: { insight: string }) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <ManikkaAvatar />
          <div>
            <h2 className="font-heading text-lg leading-tight">Manikka</h2>
            <p className="text-xs text-muted-foreground">Your money assistant</p>
          </div>
        </div>
        <p className="flex-1 text-sm leading-relaxed">{insight}</p>
        <Button asChild size="lg" className="h-11 w-full">
          <Link href="/chat" id="open-manikka-chat">
            <MessageCircle aria-hidden="true" />
            Ask Manikka
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
