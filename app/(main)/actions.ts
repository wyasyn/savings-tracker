"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { deposit as depositTable, goal as goalTable } from "@/lib/db/schema"
import { getServerSession } from "@/lib/session"
import { VALID_CHANNELS } from "@/lib/locale"

export type ActionResult = { ok: true } | { ok: false; error: string }

const idSchema = z.string().min(1).max(64)
const moneySchema = z.number().positive().max(1_000_000_000_000)

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession()
  return session?.user.id ?? null
}

function revalidate() {
  revalidatePath("/", "layout")
}

/* --- Goals ---------------------------------------------------------------- */

const createGoalSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1, "Goal name is required.").max(120),
  target: moneySchema.optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.")
    .optional(),
  createdAt: z.string().datetime(),
})

export async function createGoal(
  input: z.input<typeof createGoalSchema>
): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!userId) return { ok: false, error: "Not signed in." }

  const parsed = createGoalSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid goal." }
  }
  const g = parsed.data

  await db.insert(goalTable).values({
    id: g.id,
    userId,
    name: g.name,
    target: g.target != null ? g.target.toString() : null,
    deadline: g.deadline ?? null,
    createdAt: new Date(g.createdAt),
  })

  revalidate()
  return { ok: true }
}

const updateGoalSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1, "Goal name is required.").max(120),
  target: moneySchema.nullable().optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
})

export async function updateGoal(
  input: z.input<typeof updateGoalSchema>
): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!userId) return { ok: false, error: "Not signed in." }

  const parsed = updateGoalSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid goal." }
  }
  const g = parsed.data

  await db
    .update(goalTable)
    .set({
      name: g.name,
      target: g.target != null ? g.target.toString() : null,
      deadline: g.deadline ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(goalTable.id, g.id), eq(goalTable.userId, userId)))

  revalidate()
  return { ok: true }
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!userId) return { ok: false, error: "Not signed in." }

  await db
    .delete(goalTable)
    .where(and(eq(goalTable.id, id), eq(goalTable.userId, userId)))

  revalidate()
  return { ok: true }
}

/* --- Deposits ------------------------------------------------------------- */

const addDepositSchema = z.object({
  id: idSchema,
  goalId: idSchema,
  amount: moneySchema,
  note: z.string().trim().max(280).optional(),
  channel: z.string().refine((c) => VALID_CHANNELS.has(c)).optional(),
  createdAt: z.string().datetime(),
})

export async function addDeposit(
  input: z.input<typeof addDepositSchema>
): Promise<ActionResult> {
  const userId = await requireUserId()
  if (!userId) return { ok: false, error: "Not signed in." }

  const parsed = addDepositSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid deposit." }
  }
  const d = parsed.data

  // Ensure the goal belongs to this user before attaching a deposit.
  const [owned] = await db
    .select({ id: goalTable.id })
    .from(goalTable)
    .where(and(eq(goalTable.id, d.goalId), eq(goalTable.userId, userId)))
    .limit(1)
  if (!owned) return { ok: false, error: "Goal not found." }

  await db.insert(depositTable).values({
    id: d.id,
    goalId: d.goalId,
    userId,
    amount: d.amount.toString(),
    note: d.note ?? null,
    channel: d.channel ?? null,
    createdAt: new Date(d.createdAt),
  })

  revalidate()
  return { ok: true }
}
