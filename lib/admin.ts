import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { user as userTable, type UserRow } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/session"

/**
 * Bootstrap admins, configured via the `ADMIN_EMAILS` env var (comma-separated).
 * These accounts are always treated as admins and are auto-promoted to the
 * `admin` role the first time they open the dashboard — that solves the
 * chicken-and-egg problem of having no admin to promote the first one. After
 * promotion, better-auth's admin plugin recognises them for its own API checks.
 */
function bootstrapAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
}

/** True when the user holds the admin role or is a configured bootstrap admin. */
export function isAdmin(
  user: Pick<UserRow, "role" | "email"> | null
): boolean {
  if (!user) return false
  if (user.role === "admin") return true
  return bootstrapAdminEmails().has(user.email.toLowerCase())
}

/**
 * Resolves the current admin user, promoting a bootstrap admin to the `admin`
 * role in the DB if needed. Returns null when the caller is not an admin.
 */
export async function getAdminUser(): Promise<UserRow | null> {
  const user = await getCurrentUser()
  if (!isAdmin(user)) return null

  // Self-heal: a bootstrap admin whose DB role hasn't been set yet gets it now,
  // so the better-auth admin plugin authorises their management actions.
  if (user!.role !== "admin") {
    await db
      .update(userTable)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(userTable.id, user!.id))
    return { ...user!, role: "admin" }
  }

  return user
}
