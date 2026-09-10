export function NestMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <path
        d="M10 24.5c3.2-1.8 5.8-6.2 10-6.2s6.8 4.4 10 6.2"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12.5 20.2c2.6-1.4 4.7-4.6 7.5-4.6s4.9 3.2 7.5 4.6"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="20" cy="13" r="2.1" fill="var(--gold)" />
    </svg>
  )
}

export function NestWordmark({
  subtitle = true,
  invert = false,
}: {
  subtitle?: boolean
  invert?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <NestMark className={`size-9 ${invert ? "text-primary-foreground" : "text-primary"}`} />
      <div className="leading-none">
        <div
          className={`font-heading text-[1.65rem] tracking-tight ${invert ? "text-primary-foreground" : "text-foreground"}`}
        >
          nest
        </div>
        {subtitle ? (
          <div
            className={`mt-0.5 text-[11px] font-medium tracking-[0.18em] uppercase ${invert ? "text-primary-foreground/70" : "text-muted-foreground"}`}
          >
            Nest Bills
          </div>
        ) : null}
      </div>
    </div>
  )
}
