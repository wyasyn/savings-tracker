import type { Goal } from "@/types"
import { getGoalStatus, progressOf, totalSaved } from "@/store/useGoalStore"
import { cn } from "@/lib/utils"

export type GoalCardSize = "default" | "tall" | "wide"

type GoalCardProps = {
  goal: Goal
  size?: GoalCardSize
  className?: string
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const STRIPES = "repeating-linear-gradient(45deg, rgba(255,255,255,.3) 0 2px, transparent 2px 7px)"

export default function GoalCard({ goal, size = "default", className }: GoalCardProps) {
  const status = getGoalStatus(goal)
  const saved = totalSaved(goal)
  const percent = Math.round(progressOf(goal) * 100)
  const featured = size === "wide"

  // Color treatment by state (overridden to white when featured/wide).
  const valueColor = featured
    ? "text-white"
    : status === "completed"
      ? "text-emerald-400"
      : status === "not-started"
        ? "text-muted-foreground/60"
        : "text-orange-500"

  const fillColor = featured
    ? "bg-white"
    : status === "completed"
      ? "bg-emerald-400"
      : "bg-orange-500"

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl p-6",
        size === "tall" ? "min-h-[420px]" : "min-h-[200px]",
        featured
          ? "bg-linear-to-r from-red-700 via-orange-600 to-orange-500 text-white"
          : "border bg-card",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <h3
          className={cn("text-lg font-semibold", featured ? "text-white" : "text-foreground")}
        >
          {goal.name}
        </h3>
        {status === "completed" && (
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
              featured ? "border-white/70 text-white" : "border-emerald-500/60 text-emerald-400"
            )}
          >
            Complete
          </span>
        )}
      </header>

      {/* Spacer pushes the figures to the bottom — drives the tall layout. */}
      <div className="flex-1" />

      <p className={cn("text-5xl font-bold tracking-tight", valueColor)}>{percent}%</p>

      <div
        className={cn(
          "mt-4 h-3 w-full overflow-hidden rounded-full",
          featured ? "bg-white/20" : "bg-muted"
        )}
      >
        {percent > 0 && (
          <div
            className={cn("h-full rounded-full", fillColor)}
            style={{
              width: `${Math.min(percent, 100)}%`,
              backgroundImage: STRIPES,
            }}
          />
        )}
      </div>

      <p
        className={cn(
          "mt-3 text-sm",
          featured ? "text-white/80" : "text-muted-foreground"
        )}
      >
        {money.format(saved)} of {goal.target != null ? money.format(goal.target) : "—"}
        {"  •  "}
        {goal.deadline ? `Due ${dateFormat.format(new Date(goal.deadline))}` : "No deadline"}
      </p>
    </div>
  )
}
