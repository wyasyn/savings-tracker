import Image from 'next/image'
import Link from 'next/link'
import { NewGoalButton } from './new-goal-button'
import UserMenu from './user-menu'
import { ImpersonationBanner } from './impersonation-banner'

export default function Header() {
  return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <ImpersonationBanner />
        <div className="container py-4">
            <div className="flex items-center justify-between">
            <Link href="/" className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
                <Image src="/icons/logo-small.svg" alt="Savings Tracker" width={32} height={32} className="size-8" />
                <span className="text-lg font-semibold tracking-tight">Savings Tracker</span>
            </Link>
            <div className="flex items-center gap-3">
              <NewGoalButton />
              <UserMenu />
            </div>
            </div>
        </div>
        </header>
  )
}
