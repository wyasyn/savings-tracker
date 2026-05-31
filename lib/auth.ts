import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin, bearer, emailOTP } from "better-auth/plugins"
import { generateRandomString } from "better-auth/crypto"
import { expo } from "@better-auth/expo"

import { db, schema } from "@/lib/db"
import { sendDeleteAccountEmail, sendOtpEmail } from "@/lib/email"
import { eq } from "drizzle-orm"
import { account, deposit, goal, session } from "./db/schema"

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET

// The future Expo app authenticates against this same better-auth instance.
// Native clients aren't a browser, so they don't set an Origin from a trusted
// web domain — better-auth must be told to trust the app's deep-link scheme(s).
// better-auth already trusts `baseURL`, so the web flow is unaffected; this only
// adds extra origins for mobile. Configure via env (comma-separated), e.g.
//   MOBILE_TRUSTED_ORIGINS="savingstracker://,exp://"
// In dev, Expo Go uses exp:// URLs (often with a LAN IP), hence the wildcards.
const mobileTrustedOrigins = (process.env.MOBILE_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

// A single locked-down account for app-store reviewers. Passwordless OTP can't
// be delivered to a reviewer's inbox, so this email always accepts REVIEWER_OTP.
// Gated to one env-configured address: with REVIEWER_EMAIL unset, behavior is
// unchanged (random codes for everyone). Unset it after review to disable.
const reviewerEmail = process.env.REVIEWER_EMAIL?.trim().toLowerCase() || null
const reviewerOtp = process.env.REVIEWER_OTP?.trim() || "000000"
const isReviewer = (email: string) =>
  !!reviewerEmail && email.trim().toLowerCase() === reviewerEmail

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: mobileTrustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  // No passwords anywhere — sign-in is Google OAuth or a 6-digit email code.
  emailAndPassword: { enabled: false },
  user: {
    deleteUser: {
      enabled: true,
      // Deletion is irreversible, so require the user to confirm via a link
      // emailed to their address. better-auth only runs the deletion once the
      // `url` below is visited (it carries a short-lived signed token).
      sendDeleteAccountVerification: async ({
        user,
        url,
      }: {
        user: { email: string }
        url: string
      }) => {
        await sendDeleteAccountEmail(user.email, url)
      },
      before: async ({ userId }: { userId: string }) => {
        await db.delete(goal).where(eq(goal.userId, userId))
        await db.delete(deposit).where(eq(deposit.userId, userId))
        await db.delete(session).where(eq(session.userId, userId))
        await db.delete(account).where(eq(account.userId, userId))
      },
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10, // 10 minutes
      // Reviewer email gets a fixed, known code; everyone else gets a random one
      // (matches better-auth's default generator). Stored "plain" by default, so
      // the fixed code is the real, verifiable OTP — no DB or hashing tricks.
      generateOTP: ({ email }) =>
        isReviewer(email) ? reviewerOtp : generateRandomString(6, "0-9"),
      // Creating an account and signing in are the same flow: enter the code.
      async sendVerificationOTP({ email, otp }) {
        // Never email the reviewer's fixed code; send real codes for real users.
        if (isReviewer(email)) return
        await sendOtpEmail(email, otp)
      },
    }),
    admin({
      // Users with this role can reach the admin dashboard and manage others.
      adminRoles: ["admin"],
      // Every new account starts as a normal user; admins are promoted explicitly.
      defaultRole: "user",
    }),
    // Lets the Expo app authenticate over the same instance: rewrites OAuth
    // callbacks to the app's deep link and stores the session in SecureStore.
    // Harmless to the web app — it only activates for requests from the app.
    expo(),
    // Allows clients that can't hold cookies to send the session as
    // `Authorization: Bearer <token>`. The Expo client uses this transport;
    // the web app keeps using cookies and is unaffected.
    bearer(),
    // nextCookies must stay last so it can flush Set-Cookie headers from any
    // plugin action (e.g. impersonation) called inside a server action.
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
