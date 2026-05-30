import type { Metadata } from "next"
import Image from "next/image"

import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh  p-3 md:p-4">
      {/* Brand panel */}
      <aside className="relative hidden w-1/2 max-w-xl overflow-hidden rounded-3xl bg-linear-to-b from-orange-500 to-orange-600 p-10 md:flex md:flex-col md:justify-between">
        <Image
          src="/icons/pattern-star.svg"
          alt=""
          width={360}
          height={360}
          aria-hidden
          className="pointer-events-none absolute -right-12 bottom-8 opacity-20"
        />
        <div />
        <blockquote className="relative">
          <p className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            &ldquo;The goal isn&rsquo;t to be rich. It&rsquo;s to have enough.&rdquo;
          </p>
        </blockquote>
        <footer className="relative text-sm font-medium text-white/90">
          — Morgan Housel
        </footer>
      </aside>

      {/* Auth panel */}
      <main className="flex flex-1 flex-col px-6 py-10 sm:px-12 md:px-16 lg:px-24">
       

        <div className="flex flex-1 items-center justify-center">
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
