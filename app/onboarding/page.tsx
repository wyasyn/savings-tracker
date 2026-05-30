import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentUser, isOnboarded } from "@/lib/session"
import OnboardingFlow from "@/components/onboarding/onboarding-flow"

export const metadata: Metadata = {
  title: "Set up your account",
}

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }
  if (isOnboarded(user)) {
    redirect("/")
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <OnboardingFlow
        defaultName={user.preferredName ?? user.name ?? ""}
        email={user.email}
      />
    </div>
  )
}
