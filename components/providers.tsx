"use client"

import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster theme="dark" position="top-center" />
    </>
  )
}
