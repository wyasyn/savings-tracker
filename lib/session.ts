import { headers } from "next/headers"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user as userTable, type UserRow } from "@/lib/db/schema"

/** The better-auth session (or null) for the current request. */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() })
}

/** Full user row from the DB (includes profile/onboarding fields), or null. */
export async function getCurrentUser(): Promise<UserRow | null> {
  const session = await getServerSession()
  if (!session) return null

  const [row] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1)

  return row ?? null
}

/** A user has finished onboarding once `onboardedAt` is set. */
export function isOnboarded(user: Pick<UserRow, "onboardedAt"> | null): boolean {
  return !!user?.onboardedAt
}
