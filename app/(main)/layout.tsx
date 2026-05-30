import { redirect } from 'next/navigation'

import Header from '@/components/header'
import { getCurrentUser } from '@/lib/session'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  // Middleware already redirects when the session cookie is missing; this is the
  // authoritative check (and the only place that can read the DB).
  if (!user) {
    redirect('/login')
  }

  // Stage 2 adds: if (!isOnboarded(user)) redirect('/onboarding')

  return (
    <>
      <Header />
      <main className="container py-8">
        {children}
      </main>
    </>
  )
}
