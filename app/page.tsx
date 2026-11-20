import { LandingPage } from "@/components/landing-page"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  let signedIn = false
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      signedIn = Boolean(data.user)
    } catch {
      signedIn = false
    }
  }
  return <LandingPage signedIn={signedIn} />
}
