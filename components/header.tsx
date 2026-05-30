import Image from 'next/image'
import Link from 'next/link'
import { NewGoalButton } from './new-goal-button'

export default function Header() {
  return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-4 border-b">
        <div className="container">
            <div className="flex items-center justify-between">
            <Link href="/" className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
                <Image src="/icons/logo-small.svg" alt="Savings Tracker" width={32} height={32} className="size-8" />
                <span className="text-lg font-semibold tracking-tight">Savings Tracker</span>
            </Link>
            <NewGoalButton />
            </div>
        </div>
        </header>
  )
}
