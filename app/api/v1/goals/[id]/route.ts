import { getApiUserId } from "@/lib/api/guard"
import { error, json, notFound, unauthorized } from "@/lib/api/respond"
import { deleteGoal, updateGoal } from "@/lib/savings"

export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ id: string }> }

/** PATCH /api/v1/goals/:id — update a goal. Body: { name, target?, deadline? }. */
export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await getApiUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return error("Invalid JSON body.")
  }

  const result = await updateGoal(userId, id, body)
  if (!result.ok) {
    return result.error === "Goal not found."
      ? notFound(result.error)
      : error(result.error)
  }
  return json(result.data)
}

/** DELETE /api/v1/goals/:id — delete a goal (cascades its deposits). */
export async function DELETE(req: Request, { params }: Ctx) {
  const userId = await getApiUserId(req)
  if (!userId) return unauthorized()
  const { id } = await params

  const result = await deleteGoal(userId, id)
  if (!result.ok) return notFound(result.error)
  return json(result.data)
}
