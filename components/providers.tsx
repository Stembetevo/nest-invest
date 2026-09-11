"use client"

import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/app-shell"
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkProvider>
        <AppShell>{children}</AppShell>
      </ClerkProvider>
      <AppShell>{children}</AppShell>
      <Toaster theme="light" position="top-center" />
    </>
  )
}
