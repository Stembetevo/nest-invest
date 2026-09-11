"use client"

import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/app-shell"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster theme="light" position="top-center" />
    </>
  )
}
