import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Image
              src="/icons/logo-small.svg"
              alt="Savings Tracker"
              width={28}
              height={28}
              className="size-7"
            />
            <span className="font-semibold tracking-tight">Savings Tracker</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-orange-500 hover:underline">
            Back to app
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        <div className="legal mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>
    </div>
  )
}

/** A titled section with a heading and body content. */
export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      {children}
    </section>
  )
}
