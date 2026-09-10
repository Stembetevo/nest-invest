import type { Metadata } from "next"
import type { ReactNode } from "react"
import { DM_Sans, Fraunces } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "nest — Nest Bills",
  description:
    "M-Pesa for Treasury Bills. Start at KSh 100, pledge in 3 taps, and earn government rates. nest routes — we don’t take the risk.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="en-KE"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
