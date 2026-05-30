import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

/* -------------------------------------------------------------------------- */
/*  better-auth core tables                                                   */
/*  JS property keys must match better-auth's model fields; SQL column names  */
/*  follow snake_case. Custom profile columns are appended to `user`.         */
/* -------------------------------------------------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),

  // --- Savings Tracker profile (set during onboarding) ---
  /** Preferred display name in-app (defaults to the Google name). */
  preferredName: text("preferred_name"),
  /** ISO 3166-1 alpha-2 country code, e.g. "UG". */
  country: text("country"),
  /** ISO 4217 currency code used everywhere for this user, e.g. "UGX". */
  currency: text("currency"),
  /** Where they save: subset of "bank" | "mobile_money" | "sacco" | "cash". */
  savingsChannels: text("savings_channels").array(),
  /** Whether the user belongs to a SACCO. */
  saccoMember: boolean("sacco_member").notNull().default(false),
  /** Optional SACCO name when `saccoMember` is true. */
  saccoName: text("sacco_name"),
  /** Set once onboarding is completed; null means "needs onboarding". */
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  /** When the user accepted the Terms of Use & Privacy Policy. */
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/* -------------------------------------------------------------------------- */
/*  Savings Tracker domain tables                                             */
/* -------------------------------------------------------------------------- */

export const goal = pgTable("goal", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  /** Target amount in the user's currency; null means "no target". */
  target: numeric("target", { precision: 14, scale: 2 }),
  /** Deadline as a calendar date string "YYYY-MM-DD"; null means "no deadline". */
  deadline: text("deadline"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const deposit = pgTable("deposit", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull()
    .references(() => goal.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  note: text("note"),
  /** Channel the money came through: "bank" | "mobile_money" | "sacco" | "cash". */
  channel: text("channel"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type UserRow = typeof user.$inferSelect
export type GoalRow = typeof goal.$inferSelect
export type DepositRow = typeof deposit.$inferSelect
