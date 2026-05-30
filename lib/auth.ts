import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin, emailOTP } from "better-auth/plugins"

import { db, schema } from "@/lib/db"
import { sendOtpEmail } from "@/lib/email"

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
      // Creating an account and signing in are the same flow: enter the code.
      async sendVerificationOTP({ email, otp }) {
        await sendOtpEmail(email, otp)
      },
    }),
    admin({
      // Users with this role can reach the admin dashboard and manage others.
      adminRoles: ["admin"],
      // Every new account starts as a normal user; admins are promoted explicitly.
      defaultRole: "user",
    }),
    // nextCookies must stay last so it can flush Set-Cookie headers from any
    // plugin action (e.g. impersonation) called inside a server action.
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
