export function ManikkaMark({ className = "h-7 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 32" className={className} aria-hidden="true">
      <path
        d="M1.5 29.5 L10 11.5 L17.2 26.2 L24.2 2.2 L34.2 20.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
      />
    </svg>
  )
}

export function ManikkaWordmark() {
  return (
    <div className="flex items-center gap-2.5 text-foreground">
      <ManikkaMark />
      <span className="font-sans text-[1.35rem] font-medium tracking-tight">Manikka</span>
    </div>
  )
}
