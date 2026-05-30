"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

export type Profile = {
  name: string
  email: string
  /** ISO 4217 code, e.g. "UGX". */
  currency: string
  /** Savings channels chosen at onboarding. */
  channels: string[]
  /** Whether this user can reach the admin dashboard. */
  isAdmin: boolean
  /** True when an admin is currently impersonating this account. */
  isImpersonating: boolean
}

const ProfileContext = createContext<Profile | null>(null)

export function ProfileProvider({
  value,
  children,
}: {
  value: Profile
  children: ReactNode
}) {
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): Profile {
  const ctx = useContext(ProfileContext)
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return ctx
}

export type Money = {
  /** Currency with up to 2 decimals, e.g. "UGX 1,234.50". */
  format: (value: number) => string
  /** Currency with no decimals, e.g. "UGX 1,235". */
  formatWhole: (value: number) => string
  /** The currency symbol on its own, e.g. "USh" / "$". */
  symbol: string
  /** ISO 4217 code, e.g. "UGX". */
  code: string
}

/**
 * Currency formatters bound to the signed-in user's currency. Replaces the
 * hardcoded USD `Intl.NumberFormat` instances throughout the app.
 */
export function useMoney(): Money {
  const { currency } = useProfile()

  return useMemo(() => {
    const make = (max: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: max,
      })
    const f2 = make(2)
    const f0 = make(0)
    const symbol =
      f0.formatToParts(0).find((p) => p.type === "currency")?.value ?? currency

    return {
      format: (value: number) => f2.format(value),
      formatWhole: (value: number) => f0.format(value),
      symbol,
      code: currency,
    }
  }, [currency])
}
