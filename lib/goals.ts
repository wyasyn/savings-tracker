import "server-only"

import { asc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { deposit as depositTable, goal as goalTable } from "@/lib/db/schema"
import type { Deposit, Goal } from "@/types"

/**
 * All of a user's goals with their deposits nested, shaped exactly like the
 * client `Goal` type (amounts as numbers, dates as ISO strings). This is the
 * data the Zustand store is hydrated with on each request.
 */
export async function getGoalsForUser(userId: string): Promise<Goal[]> {
  const [goals, deposits] = await Promise.all([
    db
      .select()
      .from(goalTable)
      .where(eq(goalTable.userId, userId))
      .orderBy(asc(goalTable.createdAt)),
    db
      .select()
      .from(depositTable)
      .where(eq(depositTable.userId, userId))
      .orderBy(asc(depositTable.createdAt)),
  ])

  const byGoal = new Map<string, Deposit[]>()
  for (const d of deposits) {
    const list = byGoal.get(d.goalId) ?? []
    list.push({
      id: d.id,
      amount: Number(d.amount),
      createdAt: d.createdAt.toISOString(),
      ...(d.note ? { note: d.note } : {}),
      ...(d.channel ? { channel: d.channel } : {}),
    })
    byGoal.set(d.goalId, list)
  }

  return goals.map((g) => ({
    id: g.id,
    name: g.name,
    createdAt: g.createdAt.toISOString(),
    deposits: byGoal.get(g.id) ?? [],
    ...(g.target != null ? { target: Number(g.target) } : {}),
    ...(g.deadline ? { deadline: g.deadline } : {}),
  }))
}
