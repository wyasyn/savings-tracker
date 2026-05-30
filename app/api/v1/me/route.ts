import { getApiUserRow } from "@/lib/api/guard"
import { error, json, unauthorized } from "@/lib/api/respond"
import { completeOnboarding, toPublicProfile } from "@/lib/profile"

export const dynamic = "force-dynamic"

/** GET /api/v1/me — the signed-in user's profile (client-safe fields only). */
export async function GET(req: Request) {
  const user = await getApiUserRow(req)
  if (!user) return unauthorized()
  return json({ user: toPublicProfile(user) })
}

/**
 * PATCH /api/v1/me — complete or update onboarding (preferred name, country,
 * currency, savings channels, SACCO, terms acceptance).
 * Body matches the web onboarding form.
 */
export async function PATCH(req: Request) {
  const user = await getApiUserRow(req)
  if (!user) return unauthorized()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return error("Invalid JSON body.")
  }

  const result = await completeOnboarding(user.id, body)
  if (!result.ok) return error(result.error)
  return json({ user: result.data })
}
