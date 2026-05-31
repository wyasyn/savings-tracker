"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { LogOut, Monitor, Moon, ShieldCheck, Sun, UserX } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { useProfile } from "@/components/providers/profile-provider"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function initials(name: string, email: string) {
  const source = name.trim() || email
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  // next-themes resolves the active theme only after mount; until then `theme`
  // is undefined and rendering it would mismatch the server-rendered markup.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="px-2 py-1.5">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Theme</p>
      <div className="grid grid-cols-3 gap-1">
        {themes.map(({ value, label, icon: Icon }) => {
          const active = mounted && theme === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                active
                  ? "border-orange-600 bg-orange-600/10 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function UserMenu() {
  const router = useRouter()
  const { name, email, isAdmin, isImpersonating } = useProfile()
  const [signingOut, setSigningOut] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  async function signOut() {
    setSigningOut(true)
    await authClient.signOut()
    router.replace("/login")
    router.refresh()
  }

  async function stopImpersonating() {
    setStopping(true)
    await authClient.admin.stopImpersonating()
    router.replace("/admin")
    router.refresh()
  }

  async function deleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    // With email verification configured server-side, this doesn't delete the
    // account — it emails a confirmation link. The account is only removed once
    // that link is visited, which then lands the user on `callbackURL`.
    const { error } = await authClient.deleteUser({ callbackURL: "/login" })
    setDeleting(false)
    if (error) {
      setDeleteError(error.message ?? "Couldn't send the confirmation email. Try again.")
      return
    }
    setEmailSent(true)
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            aria-label="Account menu"
            className="flex size-9 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {initials(name, email)}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60 p-2">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <ThemeSwitcher />
          <div className="my-1 h-px bg-border" />
          {isAdmin && !isImpersonating && (
            <Button
              asChild
              variant="ghost"
              className="h-9 w-full justify-start gap-2 rounded-lg px-2 text-sm"
            >
              <Link href="/admin">
                <ShieldCheck className="size-4" />
                Admin dashboard
              </Link>
            </Button>
          )}
          {isImpersonating && (
            <Button
              variant="ghost"
              onClick={stopImpersonating}
              disabled={stopping}
              className="h-9 w-full justify-start gap-2 rounded-lg px-2 text-sm"
            >
              <UserX className="size-4" />
              {stopping ? "Stopping…" : "Stop impersonating"}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={signOut}
            disabled={signingOut}
            className="h-9 w-full justify-start gap-2 rounded-lg px-2 text-sm"
          >
            <LogOut className="size-4" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
          {/* Impersonated sessions act on someone else's account — never expose
              account deletion there. */}
          {!isImpersonating && (
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteError(null)
                setEmailSent(false)
                setConfirmOpen(true)
              }}
              className="h-9 w-full justify-start gap-2 rounded-lg px-2 text-sm text-destructive hover:text-destructive"
            >
              <UserX className="size-4" />
              Delete account
            </Button>
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          {emailSent ? (
            <>
              <DialogHeader>
                <DialogTitle>Check your email</DialogTitle>
                <DialogDescription>
                  We sent a confirmation link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Your account stays active until you open that link — it
                  permanently deletes your account and all your data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Done</Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  We&apos;ll email you a confirmation link. Opening it
                  permanently deletes your account along with all your goals and
                  deposits. This can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={deleting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={deleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Sending…" : "Email confirmation link"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
