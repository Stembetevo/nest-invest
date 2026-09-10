import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Countdown } from "@/components/countdown"
import { formatDateTime, formatLongDate } from "@/lib/dates"
import { formatKes, formatOversubscription, formatRate, formatTenor } from "@/lib/money"
import type { Auction } from "@/lib/types"

const STATUS_LABEL: Record<Auction["status"], string> = {
  open: "Open",
  closed: "Closed",
  upcoming: "Upcoming",
}

export function AuctionCard({
  auction,
  featured = false,
  action,
}: {
  auction: Auction
  featured?: boolean
  action?: "pledge" | "alert" | "none"
}) {
  const canPledge = auction.status === "open"

  return (
    <Card className={featured ? "bg-primary text-primary-foreground ring-0" : undefined}>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <p
            className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
          >
            {formatTenor(auction.tenorDays)} Treasury Bill
          </p>
          <CardTitle className={`mt-1 font-heading text-3xl ${featured ? "text-primary-foreground" : ""}`}>
            {formatRate(auction.annualRate)}
          </CardTitle>
        </div>
        <Badge variant={featured ? "secondary" : auction.status === "open" ? "default" : "secondary"}>
          {STATUS_LABEL[auction.status]}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {auction.status === "open" ? (
          <Row label="Closes" featured={featured}>
            <Countdown closesAt={auction.closesAt} /> · {formatDateTime(auction.closesAt)}
          </Row>
        ) : (
          <Row label={auction.status === "upcoming" ? "Opens toward" : "Closed"} featured={featured}>
            {formatDateTime(auction.closesAt)}
          </Row>
        )}
        <Row label="Settlement" featured={featured}>
          {formatLongDate(auction.settlementDate)}
        </Row>
        {auction.oversubscription ? (
          <Row label="Last take-up" featured={featured}>
            {formatOversubscription(auction.oversubscription)}
          </Row>
        ) : (
          <Row label="Offered" featured={featured}>
            {formatKes(auction.offeredKes, 0)}
          </Row>
        )}
      </CardContent>
      {action === "pledge" ? (
        <CardFooter className={featured ? "border-primary-foreground/15 bg-transparent px-4 pb-4" : "px-4 pb-4"}>
          {canPledge ? (
            <Button
              asChild
              size="lg"
              className={`h-11 w-full text-base ${featured ? "bg-[var(--gold)] text-primary hover:bg-[var(--gold)]/90" : ""}`}
            >
              <Link href={`/pledge?auction=${auction.id}`}>Pledge from KSh 100</Link>
            </Button>
          ) : (
            <Button size="lg" className="h-11 w-full text-base" disabled>
              Auction closed
            </Button>
          )}
        </CardFooter>
      ) : null}
    </Card>
  )
}

function Row({
  label,
  children,
  featured,
}: {
  label: string
  children: React.ReactNode
  featured?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={featured ? "text-primary-foreground/70" : "text-muted-foreground"}>{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  )
}
