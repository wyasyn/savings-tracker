"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserX } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { useProfile } from "@/components/providers/profile-provider"

export function ImpersonationBanner() {
  const { name, isImpersonating } = useProfile()
  const router = useRouter()
  const [stopping, setStopping] = useState(false)

  if (!isImpersonating) return null

  async function stop() {
    setStopping(true)
    await authClient.admin.stopImpersonating()
    router.replace("/admin")
    router.refresh()
  }

  return (
    <div className="flex items-center justify-center gap-3 bg-orange-600 px-4 py-1.5 text-center text-sm font-medium text-white">
      <span className="inline-flex items-center gap-1.5">
        <UserX className="size-4" />
        Viewing as <span className="font-semibold">{name}</span>
      </span>
      <button
        type="button"
        onClick={stop}
        disabled={stopping}
        className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold transition-colors hover:bg-white/30 disabled:opacity-60"
      >
        {stopping ? "Stopping…" : "Stop impersonating"}
      </button>
    </div>
  )
}
