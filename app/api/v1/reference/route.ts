import { json } from "@/lib/api/respond"
import { COUNTRIES, CURRENCIES, SAVINGS_CHANNELS } from "@/lib/locale"

// Static reference data for the app's onboarding pickers (countries, currencies,
// savings channels). No user data, so it can be cached aggressively and needs no
// auth — the same lists the web onboarding flow uses.
export const dynamic = "force-static"

export function GET() {
  return json({
    countries: COUNTRIES,
    currencies: CURRENCIES,
    savingsChannels: SAVINGS_CHANNELS,
  })
}
