import "server-only"

import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { user as userTable, type UserRow } from "@/lib/db/schema"
import {
  VALID_CHANNELS,
  VALID_COUNTRY_CODES,
  VALID_CURRENCY_CODES,
} from "@/lib/locale"
import type { Result } from "@/lib/savings"

/* -------------------------------------------------------------------------- */
/*  User profile (read) and onboarding/profile updates for the mobile API.    */
/*  The web app does the same via its onboarding Server Action; this module    */
/*  exposes the equivalent as a transport-agnostic function plus a serialiser  */
/*  that strips auth/admin internals (ban flags, role) the client shouldn't    */
/*  depend on.                                                                 */
/* -------------------------------------------------------------------------- */

export type PublicProfile = {
  id: string
  name: string
  email: string
  image: string | null
  preferredName: string | null
  country: string | null
  currency: string | null
  savingsChannels: string[] | null
  saccoMember: boolean
  saccoName: string | null
  onboarded: boolean
  onboardedAt: string | null
  termsAcceptedAt: string | null
}

/** Shape a DB user row into the client-safe profile sent to the app. */
export function toPublicProfile(u: UserRow): PublicProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image ?? null,
    preferredName: u.preferredName ?? null,
    country: u.country ?? null,
    currency: u.currency ?? null,
    savingsChannels: u.savingsChannels ?? null,
    saccoMember: u.saccoMember,
    saccoName: u.saccoName ?? null,
    onboarded: !!u.onboardedAt,
    onboardedAt: u.onboardedAt?.toISOString() ?? null,
    termsAcceptedAt: u.termsAcceptedAt?.toISOString() ?? null,
  }
}

// Mirrors the web onboarding action's validation (see app/onboarding/actions.ts).
const onboardingSchema = z
  .object({
    preferredName: z.string().trim().min(1, "Tell us what to call you.").max(80),
    country: z
      .string()
      .refine((c) => VALID_COUNTRY_CODES.has(c), "Pick your country."),
    currency: z
      .string()
      .refine((c) => VALID_CURRENCY_CODES.has(c), "Pick your currency."),
    channels: z
      .array(z.string().refine((c) => VALID_CHANNELS.has(c)))
      .min(1, "Choose at least one place you save."),
    saccoMember: z.boolean(),
    saccoName: z.string().trim().max(120).optional(),
    acceptTerms: z.literal(true, {
      message: "You must accept the Terms and Privacy Policy.",
    }),
  })
  .refine((d) => !d.saccoMember || (d.saccoName && d.saccoName.length > 0), {
    message: "Enter your SACCO's name.",
    path: ["saccoName"],
  })

/**
 * Complete (or re-submit) onboarding from the mobile app. Sets the same fields
 * the web onboarding flow does, including `onboardedAt`/`termsAcceptedAt`.
 */
export async function completeOnboarding(
  userId: string,
  input: unknown
): Promise<Result<PublicProfile>> {
  const parsed = onboardingSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check your answers.",
    }
  }
  const d = parsed.data
  const now = new Date()

  const [row] = await db
    .update(userTable)
    .set({
      preferredName: d.preferredName,
      country: d.country,
      currency: d.currency,
      savingsChannels: d.channels,
      saccoMember: d.saccoMember,
      saccoName: d.saccoMember ? (d.saccoName ?? null) : null,
      onboardedAt: now,
      termsAcceptedAt: now,
      updatedAt: now,
    })
    .where(eq(userTable.id, userId))
    .returning()

  if (!row) return { ok: false, error: "User not found." }
  return { ok: true, data: toPublicProfile(row) }
}
