/** The landing page shows one view at a time. `id` is the view and the URL hash (`/#features`). */
export const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "how", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
] as const

export type LandingView = (typeof NAV_LINKS)[number]["id"]

export const isLandingView = (value: string): value is LandingView =>
  NAV_LINKS.some((link) => link.id === value)
