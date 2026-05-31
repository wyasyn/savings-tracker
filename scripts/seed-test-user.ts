/**
 * Seed (or re-seed) a stable test user with realistic goals + deposits.
 *
 * Idempotent: re-running wipes this test user's goals/deposits and rebuilds
 * them, so screenshots and manual testing always start from the same state.
 * It does NOT touch any other user's data.
 *
 * Run:  pnpm seed:test-user
 *
 * Login: email OTP only (no password). Request a code for TEST_EMAIL on the
 * app/emulator. In production the code is emailed; locally (no RESEND_API_KEY)
 * it prints to the `pnpm dev` terminal.
 */
import "dotenv/config"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"

import { db } from "../lib/db/index"
import { user, goal, deposit } from "../lib/db/schema"

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? "ywalum+test@gmail.com"
const TEST_USER_ID = "test-user-savings-demo" // fixed, so re-seeds are stable

/** A calendar Date at noon UTC, so month bucketing never slips a day. */
function on(year: number, month1: number, day: number): Date {
  return new Date(Date.UTC(year, month1 - 1, day, 12, 0, 0))
}

/** UGX amounts are whole shillings; numeric(14,2) takes a string. */
function money(n: number): string {
  return n.toFixed(2)
}

type SeedDeposit = {
  amount: number
  channel: "bank" | "mobile_money" | "sacco" | "cash"
  note?: string
  at: Date
}

type SeedGoal = {
  name: string
  target: number | null
  deadline: string | null // "YYYY-MM-DD"
  createdAt: Date
  deposits: SeedDeposit[]
}

// Today in the seed world is 2026-05-31. Deposits are spread across the last
// ~6 months so the monthly-deposits chart looks populated.
const GOALS: SeedGoal[] = [
  {
    name: "Emergency Fund",
    target: 3_000_000,
    deadline: null,
    createdAt: on(2025, 12, 3),
    deposits: [
      { amount: 300_000, channel: "mobile_money", note: "December salary set-aside", at: on(2025, 12, 5) },
      { amount: 250_000, channel: "mobile_money", note: "Side gig", at: on(2026, 1, 9) },
      { amount: 400_000, channel: "bank", note: "January salary", at: on(2026, 1, 28) },
      { amount: 350_000, channel: "bank", at: on(2026, 2, 26) },
      { amount: 300_000, channel: "mobile_money", note: "MoMo top-up", at: on(2026, 3, 18) },
      { amount: 450_000, channel: "bank", note: "Bonus", at: on(2026, 4, 25) },
      { amount: 300_000, channel: "mobile_money", at: on(2026, 5, 20) },
    ],
  },
  {
    name: "New Laptop",
    target: 4_500_000,
    deadline: "2026-09-30",
    createdAt: on(2026, 1, 15),
    deposits: [
      { amount: 500_000, channel: "bank", note: "Kick-off", at: on(2026, 1, 20) },
      { amount: 400_000, channel: "mobile_money", at: on(2026, 2, 14) },
      { amount: 600_000, channel: "sacco", note: "SACCO dividend", at: on(2026, 3, 30) },
      { amount: 450_000, channel: "bank", at: on(2026, 4, 22) },
      { amount: 550_000, channel: "mobile_money", note: "Freelance payout", at: on(2026, 5, 12) },
    ],
  },
  {
    name: "Trip to Zanzibar",
    target: 2_000_000,
    deadline: "2026-08-15",
    createdAt: on(2026, 2, 2),
    deposits: [
      { amount: 200_000, channel: "cash", note: "Holiday jar", at: on(2026, 2, 10) },
      { amount: 250_000, channel: "mobile_money", at: on(2026, 3, 11) },
      { amount: 300_000, channel: "bank", at: on(2026, 4, 8) },
      { amount: 250_000, channel: "cash", note: "Sold old phone", at: on(2026, 5, 6) },
    ],
  },
  {
    name: "School Fees — Term 2",
    target: 1_500_000,
    deadline: "2026-07-01",
    createdAt: on(2026, 3, 1),
    deposits: [
      { amount: 500_000, channel: "sacco", note: "SACCO savings", at: on(2026, 3, 15) },
      { amount: 450_000, channel: "bank", at: on(2026, 4, 16) },
      { amount: 400_000, channel: "mobile_money", at: on(2026, 5, 18) },
    ],
  },
  {
    // A fully-funded goal so the "completed" hero screen is reachable.
    name: "Phone Upgrade",
    target: 1_200_000,
    deadline: null,
    createdAt: on(2025, 11, 10),
    deposits: [
      { amount: 400_000, channel: "mobile_money", note: "Month 1", at: on(2025, 11, 12) },
      { amount: 400_000, channel: "mobile_money", note: "Month 2", at: on(2025, 12, 14) },
      { amount: 400_000, channel: "bank", note: "Final top-up — done!", at: on(2026, 1, 16) },
    ],
  },
]

async function main() {
  console.info(`\nSeeding test user: ${TEST_EMAIL} (id: ${TEST_USER_ID})`)

  const now = new Date()

  // 1) Upsert the user as a fully-onboarded UGX saver (so the app lands on the
  //    home screen, not onboarding — better for screenshots).
  const profile = {
    name: "Amina Test",
    email: TEST_EMAIL,
    emailVerified: true,
    image: null,
    preferredName: "Amina",
    country: "UG",
    currency: "UGX",
    savingsChannels: ["mobile_money", "bank", "sacco", "cash"],
    saccoMember: true,
    saccoName: "Kampala Teachers SACCO",
    onboardedAt: now,
    termsAcceptedAt: now,
    role: "user",
    banned: false,
    updatedAt: now,
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, TEST_EMAIL))
    .limit(1)

  let userId = TEST_USER_ID
  if (existing[0]) {
    userId = existing[0].id
    await db.update(user).set(profile).where(eq(user.id, userId))
    console.info("  Updated existing user row.")
  } else {
    await db.insert(user).values({ id: TEST_USER_ID, createdAt: now, ...profile })
    console.info("  Inserted new user row.")
  }

  // 2) Wipe this user's existing goals/deposits (deposits cascade on goal
  //    delete via FK, but delete explicitly to be safe across drivers).
  await db.delete(deposit).where(eq(deposit.userId, userId))
  await db.delete(goal).where(eq(goal.userId, userId))
  console.info("  Cleared previous goals + deposits.")

  // 3) Insert fresh goals + deposits.
  let goalCount = 0
  let depositCount = 0
  for (const g of GOALS) {
    const goalId = randomUUID()
    await db.insert(goal).values({
      id: goalId,
      userId,
      name: g.name,
      target: g.target === null ? null : money(g.target),
      deadline: g.deadline,
      createdAt: g.createdAt,
      updatedAt: g.createdAt,
    })
    goalCount++

    for (const dep of g.deposits) {
      await db.insert(deposit).values({
        id: randomUUID(),
        goalId,
        userId,
        amount: money(dep.amount),
        note: dep.note ?? null,
        channel: dep.channel,
        createdAt: dep.at,
      })
      depositCount++
    }
  }

  console.info(`  Inserted ${goalCount} goals and ${depositCount} deposits.`)
  console.info("\nDone. Log in with email OTP using:", TEST_EMAIL)
  console.info("(Production emails the code; local dev prints it to the server console.)\n")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nSeed failed:", err)
    process.exit(1)
  })
