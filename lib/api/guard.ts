import "server-only"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { user as userTable, type UserRow } from "@/lib/db/schema"

/* -------------------------------------------------------------------------- */
/*  Authentication guard for the mobile REST API.                             */
/*                                                                            */
/*  Route handlers receive the raw `Request`, so we read the session straight */
/*  from its headers via better-auth. This resolves both transports: the web  */
/*  cookie AND the Expo client's `Authorization: Bearer <token>` (enabled by  */
/*  the bearer plugin). On success you get just the user id; use              */
/*  `requireApiUserRow` when a handler also needs the profile columns.        */
/* -------------------------------------------------------------------------- */

/** Resolves the signed-in user's id from a request, or null if unauthenticated. */
export async function getApiUserId(req: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user.id ?? null
}

/** Full user row (profile + onboarding fields) for the request, or null. */
export async function getApiUserRow(req: Request): Promise<UserRow | null> {
  const userId = await getApiUserId(req)
  if (!userId) return null

  const [row] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)

  return row ?? null
}
