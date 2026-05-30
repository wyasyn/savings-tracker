import { getApiUserId } from "@/lib/api/guard"
import { error, json, notFound, unauthorized } from "@/lib/api/respond"
import { addDeposit } from "@/lib/savings"

export const dynamic = "force-dynamic"

/**
 * POST /api/v1/deposits — record a deposit against one of the user's goals.
 * Body: { goalId, amount, note?, channel? }.
 */
export async function POST(req: Request) {
  const userId = await getApiUserId(req)
  if (!userId) return unauthorized()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return error("Invalid JSON body.")
  }

  const result = await addDeposit(userId, body)
  if (!result.ok) {
    return result.error === "Goal not found."
      ? notFound(result.error)
      : error(result.error)
  }
  return json(result.data, 201)
}
