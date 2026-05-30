import "server-only"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { deposit as depositTable, goal as goalTable } from "@/lib/db/schema"
import { VALID_CHANNELS } from "@/lib/locale"
import type { Goal } from "@/types"

export { getGoalsForUser as listGoalsForUser } from "@/lib/goals"

/* -------------------------------------------------------------------------- */
/*  Transport-agnostic goal & deposit operations shared by the mobile REST    */
/*  API. These take an already-authenticated `userId`, validate input, write  */
/*  to the DB and return a plain result — no cookies, no revalidation. The     */
/*  web app keeps its own Server Actions in `app/(main)/actions.ts`; this      */
/*  module is purely additive and exists so the Expo client has JSON          */
/*  endpoints to call. Unlike the web actions (where the client supplies the   */
/*  id/createdAt), these generate them server-side when omitted, which is the  */
/*  safer default for a public API.                                            */
/* -------------------------------------------------------------------------- */

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

const moneySchema = z.number().positive().max(1_000_000_000_000)
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.")

function firstError(e: z.ZodError, fallback: string): string {
  return e.issues[0]?.message ?? fallback
}

/* --- Goals ---------------------------------------------------------------- */

const createGoalSchema = z.object({
  name: z.string().trim().min(1, "Goal name is required.").max(120),
  target: moneySchema.optional(),
  deadline: dateOnly.optional(),
})

export async function createGoal(
  userId: string,
  input: unknown
): Promise<Result<Goal>> {
  const parsed = createGoalSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error, "Invalid goal.") }
  }
  const g = parsed.data
  const id = crypto.randomUUID()
  const createdAt = new Date()

  await db.insert(goalTable).values({
    id,
    userId,
    name: g.name,
    target: g.target != null ? g.target.toString() : null,
    deadline: g.deadline ?? null,
    createdAt,
  })

  return {
    ok: true,
    data: {
      id,
      name: g.name,
      createdAt: createdAt.toISOString(),
      deposits: [],
      ...(g.target != null ? { target: g.target } : {}),
      ...(g.deadline ? { deadline: g.deadline } : {}),
    },
  }
}

const updateGoalSchema = z.object({
  name: z.string().trim().min(1, "Goal name is required.").max(120),
  target: moneySchema.nullable().optional(),
  deadline: dateOnly.nullable().optional(),
})

export async function updateGoal(
  userId: string,
  goalId: string,
  input: unknown
): Promise<Result<{ id: string }>> {
  const parsed = updateGoalSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error, "Invalid goal.") }
  }
  const g = parsed.data

  const updated = await db
    .update(goalTable)
    .set({
      name: g.name,
      target: g.target != null ? g.target.toString() : null,
      deadline: g.deadline ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(goalTable.id, goalId), eq(goalTable.userId, userId)))
    .returning({ id: goalTable.id })

  if (updated.length === 0) return { ok: false, error: "Goal not found." }
  return { ok: true, data: { id: goalId } }
}

export async function deleteGoal(
  userId: string,
  goalId: string
): Promise<Result<{ id: string }>> {
  const deleted = await db
    .delete(goalTable)
    .where(and(eq(goalTable.id, goalId), eq(goalTable.userId, userId)))
    .returning({ id: goalTable.id })

  if (deleted.length === 0) return { ok: false, error: "Goal not found." }
  return { ok: true, data: { id: goalId } }
}

/* --- Deposits ------------------------------------------------------------- */

const addDepositSchema = z.object({
  goalId: z.string().min(1).max(64),
  amount: moneySchema,
  note: z.string().trim().max(280).optional(),
  channel: z
    .string()
    .refine((c) => VALID_CHANNELS.has(c), "Invalid channel.")
    .optional(),
})

export async function addDeposit(
  userId: string,
  input: unknown
): Promise<Result<{ id: string; goalId: string }>> {
  const parsed = addDepositSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error, "Invalid deposit.") }
  }
  const d = parsed.data

  // Ensure the goal belongs to this user before attaching a deposit.
  const [owned] = await db
    .select({ id: goalTable.id })
    .from(goalTable)
    .where(and(eq(goalTable.id, d.goalId), eq(goalTable.userId, userId)))
    .limit(1)
  if (!owned) return { ok: false, error: "Goal not found." }

  const id = crypto.randomUUID()
  await db.insert(depositTable).values({
    id,
    goalId: d.goalId,
    userId,
    amount: d.amount.toString(),
    note: d.note ?? null,
    channel: d.channel ?? null,
    createdAt: new Date(),
  })

  return { ok: true, data: { id, goalId: d.goalId } }
}
