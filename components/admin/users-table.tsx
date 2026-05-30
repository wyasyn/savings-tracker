"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Ban,
  CircleSlash,
  LogIn,
  MoreHorizontal,
  ShieldCheck,
  ShieldX,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  banUser,
  deleteUser,
  impersonateUser,
  revokeUserSessions,
  setUserRole,
  unbanUser,
  type ActionResult,
} from "@/app/(admin)/admin/actions"

export type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: "admin" | "user"
  banned: boolean
  banReason: string | null
  banExpires: string | null
  emailVerified: boolean
  createdAt: string
}

function initials(name: string, email: string) {
  const source = name.trim() || email
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[]
  currentUserId: string
}) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, query])

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search by name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-hidden rounded-xl border">
        {/* Header (desktop only) — columns must match UserRow's grid template */}
        <div className="hidden grid-cols-[1fr_6rem_6rem_7rem_2.5rem] gap-4 border-b bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Joined</span>
          <span aria-hidden />
        </div>

        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No users match “{query}”.
          </p>
        ) : (
          <ul className="divide-y">
            {filtered.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isSelf={u.id === currentUserId}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function RolePill({ role }: { role: "admin" | "user" }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-600/10 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-400">
      <ShieldCheck className="size-3" />
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      User
    </span>
  )
}

function StatusPill({ user }: { user: AdminUser }) {
  if (user.banned) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
        <Ban className="size-3" />
        Banned
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      Active
    </span>
  )
}

function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [banOpen, setBanOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function run(action: () => Promise<ActionResult>, onDone?: () => void) {
    setError(null)
    startTransition(async () => {
      const res = await action()
      if (!res.ok) {
        setError(res.error)
        return
      }
      onDone?.()
      router.refresh()
    })
  }

  const banExpiry = user.banExpires
    ? dateFmt.format(new Date(user.banExpires))
    : null

  return (
    <li className="relative px-4 py-3">
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_6rem_6rem_7rem_2.5rem] sm:items-center sm:gap-4">
        {/* User identity */}
        <div className="flex min-w-0 items-center gap-3 pr-10 sm:pr-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {initials(user.name, user.email)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              {user.name}
              {isSelf && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  You
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        {/* Role / Status / Joined — inline on mobile, grid columns on desktop */}
        <div className="flex flex-wrap items-center gap-2 sm:contents">
          {/* Role */}
          <div className="sm:justify-self-start">
            <RolePill role={user.role} />
          </div>

          {/* Status */}
          <div className="sm:justify-self-start">
            <StatusPill user={user} />
          </div>

          {/* Joined */}
          <div className="text-xs text-muted-foreground sm:justify-self-end sm:text-right">
            {dateFmt.format(new Date(user.createdAt))}
          </div>
        </div>

        {/* Actions — top-right on mobile, last column on desktop */}
        <div className="absolute right-4 top-3 sm:static sm:justify-self-end">
          {isSelf ? (
            <span className="inline-block size-8" aria-hidden />
          ) : (
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${user.name}`}
                  disabled={isPending}
                >
                  <MoreHorizontal />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-1.5">
                {/* Role */}
                {user.role === "admin" ? (
                  <MenuItem
                    icon={<ShieldX className="size-4" />}
                    onClick={() =>
                      run(
                        () => setUserRole({ userId: user.id, role: "user" }),
                        () => setMenuOpen(false)
                      )
                    }
                  >
                    Revoke admin
                  </MenuItem>
                ) : (
                  <MenuItem
                    icon={<ShieldCheck className="size-4" />}
                    onClick={() =>
                      run(
                        () => setUserRole({ userId: user.id, role: "admin" }),
                        () => setMenuOpen(false)
                      )
                    }
                  >
                    Make admin
                  </MenuItem>
                )}

                <MenuItem
                  icon={<LogIn className="size-4" />}
                  onClick={() =>
                    run(() => impersonateUser(user.id), () => router.push("/"))
                  }
                >
                  Impersonate
                </MenuItem>

                <MenuItem
                  icon={<CircleSlash className="size-4" />}
                  onClick={() =>
                    run(
                      () => revokeUserSessions(user.id),
                      () => setMenuOpen(false)
                    )
                  }
                >
                  Sign out everywhere
                </MenuItem>

                <div className="my-1 h-px bg-border" />

                {/* Ban / unban */}
                {user.banned ? (
                  <MenuItem
                    icon={<Ban className="size-4" />}
                    onClick={() =>
                      run(
                        () => unbanUser(user.id),
                        () => setMenuOpen(false)
                      )
                    }
                  >
                    Unban
                  </MenuItem>
                ) : (
                  <MenuItem
                    icon={<Ban className="size-4" />}
                    onClick={() => {
                      setMenuOpen(false)
                      setBanOpen(true)
                    }}
                  >
                    Ban…
                  </MenuItem>
                )}

                <MenuItem
                  destructive
                  icon={<Trash2 className="size-4" />}
                  onClick={() => {
                    setMenuOpen(false)
                    setDeleteOpen(true)
                  }}
                >
                  Delete…
                </MenuItem>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Inline context: ban reason / expiry / errors */}
      {(user.banned && (user.banReason || banExpiry)) || error ? (
        <div className="mt-2 space-y-1 pl-12 text-xs">
          {user.banned && user.banReason && (
            <p className="text-muted-foreground">
              Reason: <span className="text-foreground">{user.banReason}</span>
            </p>
          )}
          {user.banned && (
            <p className="text-muted-foreground">
              {banExpiry ? `Ban lifts ${banExpiry}` : "Permanent ban"}
            </p>
          )}
          {error && <p className="text-destructive">{error}</p>}
        </div>
      ) : null}

      <BanDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        user={user}
        pending={isPending}
        onConfirm={(reason, expiresInDays) =>
          run(
            () =>
              banUser({
                userId: user.id,
                ...(reason ? { reason } : {}),
                ...(expiresInDays ? { expiresInDays } : {}),
              }),
            () => setBanOpen(false)
          )
        }
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={user}
        pending={isPending}
        onConfirm={() =>
          run(() => deleteUser(user.id), () => setDeleteOpen(false))
        }
      />
    </li>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
  destructive,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted " +
        (destructive ? "text-destructive hover:bg-destructive/10" : "")
      }
    >
      {icon}
      {children}
    </button>
  )
}

function BanDialog({
  open,
  onOpenChange,
  user,
  pending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: AdminUser
  pending: boolean
  onConfirm: (reason: string, expiresInDays?: number) => void
}) {
  const [reason, setReason] = useState("")
  const [days, setDays] = useState("")

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          setReason("")
          setDays("")
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban {user.name}?</DialogTitle>
          <DialogDescription>
            They’ll be signed out and blocked from signing in until the ban is
            lifted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ban-reason">Reason (optional)</Label>
            <Textarea
              id="ban-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Visible to other admins"
              maxLength={280}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ban-days">Duration in days (optional)</Label>
            <Input
              id="ban-days"
              type="number"
              min={1}
              max={3650}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Leave blank for a permanent ban"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              const parsed = Number.parseInt(days, 10)
              onConfirm(
                reason.trim(),
                Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
              )
            }}
          >
            {pending ? "Banning…" : "Ban user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  open,
  onOpenChange,
  user,
  pending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: AdminUser
  pending: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {user.name}?</DialogTitle>
          <DialogDescription>
            This permanently removes the account along with all of their goals
            and deposits. This can’t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
