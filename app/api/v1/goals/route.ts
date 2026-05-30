import { getApiUserId } from "@/lib/api/guard"
import { error, json, unauthorized } from "@/lib/api/respond"
import { createGoal, listGoalsForUser } from "@/lib/savings"

// This API is consumed by the Expo mobile app, never pre-rendered.
export const dynamic = "force-dynamic"

/** GET /api/v1/goals — all of the signed-in user's goals with nested deposits. */
export async function GET(req: Request) {
  const userId = await getApiUserId(req)
  if (!userId) return unauthorized()

  const goals = await listGoalsForUser(userId)
  return json({ goals })
}

/** POST /api/v1/goals — create a goal. Body: { name, target?, deadline? }. */
export async function POST(req: Request) {
  const userId = await getApiUserId(req)
  if (!userId) return unauthorized()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return error("Invalid JSON body.")
  }

  const result = await createGoal(userId, body)
  if (!result.ok) return error(result.error)
  return json(result.data, 201)
}
