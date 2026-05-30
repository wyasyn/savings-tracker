"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { getAdminUser } from "@/lib/admin"

export type ActionResult = { ok: true } | { ok: false; error: string }

const userIdSchema = z.string().min(1).max(64)

/** Runs `fn` only for an authenticated admin, mapping errors to a friendly result. */
async function withAdmin(
  fn: (ctx: { adminId: string; headers: Headers }) => Promise<void>
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin) return { ok: false, error: "Not authorized." }

  try {
    await fn({ adminId: admin.id, headers: await headers() })
    revalidatePath("/admin")
    return { ok: true }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong."
    return { ok: false, error: message }
  }
}

/* --- Role management ------------------------------------------------------ */

const setRoleSchema = z.object({
  userId: userIdSchema,
  role: z.enum(["admin", "user"]),
})

export async function setUserRole(
  input: z.infer<typeof setRoleSchema>
): Promise<ActionResult> {
  const parsed = setRoleSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid request." }
  const { userId, role } = parsed.data

  return withAdmin(async ({ adminId, headers }) => {
    if (userId === adminId && role !== "admin") {
      throw new Error("You can't remove your own admin role.")
    }
    await auth.api.setRole({ body: { userId, role }, headers })
  })
}

/* --- Ban / unban ---------------------------------------------------------- */

const banSchema = z.object({
  userId: userIdSchema,
  reason: z.string().trim().max(280).optional(),
  /** Days until the ban lifts; omitted/0 means a permanent ban. */
  expiresInDays: z.number().int().positive().max(3650).optional(),
})

export async function banUser(
  input: z.infer<typeof banSchema>
): Promise<ActionResult> {
  const parsed = banSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid request." }
  const { userId, reason, expiresInDays } = parsed.data

  return withAdmin(async ({ adminId, headers }) => {
    if (userId === adminId) throw new Error("You can't ban yourself.")
    await auth.api.banUser({
      body: {
        userId,
        ...(reason ? { banReason: reason } : {}),
        ...(expiresInDays
          ? { banExpiresIn: expiresInDays * 24 * 60 * 60 }
          : {}),
      },
      headers,
    })
  })
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  const parsed = userIdSchema.safeParse(userId)
  if (!parsed.success) return { ok: false, error: "Invalid request." }

  return withAdmin(async ({ headers }) => {
    await auth.api.unbanUser({ body: { userId: parsed.data }, headers })
  })
}

/* --- Sessions ------------------------------------------------------------- */

export async function revokeUserSessions(
  userId: string
): Promise<ActionResult> {
  const parsed = userIdSchema.safeParse(userId)
  if (!parsed.success) return { ok: false, error: "Invalid request." }

  return withAdmin(async ({ headers }) => {
    await auth.api.revokeUserSessions({ body: { userId: parsed.data }, headers })
  })
}

/* --- Delete --------------------------------------------------------------- */

export async function deleteUser(userId: string): Promise<ActionResult> {
  const parsed = userIdSchema.safeParse(userId)
  if (!parsed.success) return { ok: false, error: "Invalid request." }

  return withAdmin(async ({ adminId, headers }) => {
    if (parsed.data === adminId) throw new Error("You can't delete yourself.")
    await auth.api.removeUser({ body: { userId: parsed.data }, headers })
  })
}

/* --- Impersonation -------------------------------------------------------- */

export async function impersonateUser(userId: string): Promise<ActionResult> {
  const parsed = userIdSchema.safeParse(userId)
  if (!parsed.success) return { ok: false, error: "Invalid request." }

  return withAdmin(async ({ adminId, headers }) => {
    if (parsed.data === adminId) throw new Error("You're already yourself.")
    // Swaps the session cookie for an impersonation session; nextCookies()
    // flushes the Set-Cookie header from this server action.
    await auth.api.impersonateUser({ body: { userId: parsed.data }, headers })
  })
}
