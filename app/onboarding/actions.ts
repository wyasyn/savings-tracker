"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema"
import { getServerSession } from "@/lib/session"
import {
  VALID_CHANNELS,
  VALID_COUNTRY_CODES,
  VALID_CURRENCY_CODES,
} from "@/lib/locale"

const schema = z
  .object({
    preferredName: z.string().trim().min(1, "Tell us what to call you.").max(80),
    country: z.string().refine((c) => VALID_COUNTRY_CODES.has(c), "Pick your country."),
    currency: z.string().refine((c) => VALID_CURRENCY_CODES.has(c), "Pick your currency."),
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

export type OnboardingInput = z.input<typeof schema>

export type OnboardingResult = { ok: false; error: string } | { ok: true }

export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const session = await getServerSession()
  if (!session) {
    return { ok: false, error: "Your session expired. Please sign in again." }
  }

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your answers." }
  }

  const d = parsed.data
  const now = new Date()

  await db
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
    .where(eq(userTable.id, session.user.id))

  redirect("/")
}
