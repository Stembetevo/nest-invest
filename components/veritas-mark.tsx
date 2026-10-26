export function VeritasMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <path
        d="M11 11.5 20 29.5 29 11.5"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function VeritasWordmark({
  invert = false,
}: {
  invert?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <VeritasMark className={`size-9 ${invert ? "text-primary-foreground" : "text-foreground"}`} />
      <span
        className={`font-heading text-[1.55rem] tracking-tight ${invert ? "text-primary-foreground" : "text-foreground"}`}
      >
        Veritas
      </span>
    </div>
  )
}
