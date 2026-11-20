import type { Metadata } from "next"
import type { ReactNode } from "react"
import localFont from "next/font/local"
import { Providers } from "@/components/providers"
import "./globals.css"

const dmSans = localFont({
  src: "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 1000",
  display: "swap",
})

const fraunces = localFont({
  src: "../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
  variable: "--font-heading",
  weight: "100 900",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Manikka — Prove your income",
  description:
    "Manikka turns informal earnings into a verified income report lenders can trust. Free for you. Lenders pay for the proof.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="en-KE"
      suppressHydrationWarning
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
