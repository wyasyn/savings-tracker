import { redirect } from 'next/navigation'

import Header from '@/components/header'
import { ProfileProvider } from '@/components/providers/profile-provider'
import { getCurrentUser, getServerSession, isOnboarded } from '@/lib/session'
import { isAdmin } from '@/lib/admin'
import { getGoalsForUser } from '@/lib/goals'
import { GoalStoreProvider } from '@/store/useGoalStore'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, session] = await Promise.all([getCurrentUser(), getServerSession()])

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
        isAdmin: isAdmin(user),
        isImpersonating: !!session?.session.impersonatedBy,
      }}
    >
      <GoalStoreProvider goals={goals}>
        <Header />
        <main className="container py-8">{children}</main>
      </GoalStoreProvider>
    </ProfileProvider>
  )
}
