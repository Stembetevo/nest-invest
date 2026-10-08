"use client"

import { useEffect, useRef } from "react"
import { CircleAlert, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PageLoading({ label, blocks = 3 }: { label: string; blocks?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">{label}</span>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      {Array.from({ length: blocks }, (_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  )
}

export function PageError({
  title,
  body,
  retry,
  error,
}: {
  title: string
  body: string
  retry: () => void
  error?: Error
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (error) console.error(error)
    headingRef.current?.focus()
  }, [error])

  return (
    <div role="alert" className="rounded-3xl bg-card px-5 py-10 text-center ring-1 ring-foreground/10">
      <CircleAlert className="mx-auto size-8 text-destructive" aria-hidden="true" />
      <h1 ref={headingRef} tabIndex={-1} className="font-heading mt-4 text-2xl outline-none">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      <Button size="lg" className="mt-6 h-11 px-5" onClick={retry}>
        <RotateCcw aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}
