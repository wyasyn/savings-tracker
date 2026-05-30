import { redirect } from 'next/navigation'

import Header from '@/components/header'
import { ProfileProvider } from '@/components/providers/profile-provider'
import { getCurrentUser, isOnboarded } from '@/lib/session'
import { getGoalsForUser } from '@/lib/goals'
import { GoalStoreProvider } from '@/store/useGoalStore'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  // Middleware already redirects when the session cookie is missing; this is the
  // authoritative check (and the only place that can read the DB).
  if (!user) {
    redirect('/login')
  }

  // First-time users must finish onboarding before reaching the app.
  if (!isOnboarded(user)) {
    redirect('/onboarding')
  }

  const goals = await getGoalsForUser(user.id)

  return (
    <ProfileProvider
      value={{
        name: user.preferredName ?? user.name,
        email: user.email,
        currency: user.currency ?? 'USD',
        channels: user.savingsChannels ?? [],
      }}
    >
      <GoalStoreProvider goals={goals}>
        <Header />
        <main className="container py-8">{children}</main>
      </GoalStoreProvider>
    </ProfileProvider>
  )
}
