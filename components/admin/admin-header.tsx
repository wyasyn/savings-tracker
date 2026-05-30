import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 py-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Image
              src="/icons/logo-small.svg"
              alt="Savings Tracker"
              width={32}
              height={32}
              className="size-8"
            />
            <span className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
              Admin
              <ShieldCheck className="size-4 text-orange-600" />
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to app
          </Link>
        </div>
      </div>
    </header>
  )
}
