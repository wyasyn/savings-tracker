"use client"

import Link from "next/link"
import { ChevronLeft, Check } from "lucide-react"

import { isCompleted, progressOf, totalSaved, useGoalStore } from "@/store/useGoalStore"
import { cn } from "@/lib/utils"
import AddDepositForm from "./add-deposit-form"
import DepositHistory from "./deposit-history"
import DeleteGoalDialog from "./delete-goal-dialog"
import { EditGoalButton } from "./new-goal-button"

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const STRIPES = "repeating-linear-gradient(45deg, rgba(255,255,255,.3) 0 2px, transparent 2px 7px)"

export default function GoalDetail({ goalId }: { goalId: string }) {
  const goal = useGoalStore((state) => state.goals.find((g) => g.id === goalId))

  if (!goal) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">This goal could not be found.</p>
        <Link href="/" className="text-sm font-medium text-orange-500 hover:underline">
          Back to goals
        </Link>
      </div>
    )
  }

  const saved = totalSaved(goal)
  const percent = Math.round(progressOf(goal) * 100)
  const remaining = goal.target != null ? Math.max(goal.target - saved, 0) : null
  const complete = isCompleted(goal)

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <div className="flex items-center gap-6">
          <EditGoalButton
            goal={goal}
            trigger={
              <button className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Edit goal
              </button>
            }
          />
          <DeleteGoalDialog goal={goal} />
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{goal.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {goal.deadline ? `Due ${dateFormat.format(new Date(goal.deadline))}` : "No deadline"}
          {"  •  "}
          Created {dateFormat.format(new Date(goal.createdAt))}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {complete ? (
            <CompleteHero goal={goal} saved={saved} />
          ) : (
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <p
                  className={cn(
                    "text-5xl font-bold tracking-tight",
                    percent > 0 ? "text-orange-500" : "text-muted-foreground/60"
                  )}
                >
                  {percent}%
                </p>
                {remaining != null && (
                  <p className="text-lg font-semibold text-foreground">
                    {money.format(remaining)} remaining
                  </p>
                )}
              </div>

              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
                {percent > 0 && (
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${Math.min(percent, 100)}%`, backgroundImage: STRIPES }}
                  />
                )}
              </div>

              <div className="mt-4 flex items-end justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{money.format(saved)}</p>
                  <p className="text-muted-foreground">Saved so far</p>
                </div>
                {goal.target != null && (
                  <div className="text-right">
                    <p className="font-medium text-foreground">of {money.format(goal.target)}</p>
                    <p className="text-muted-foreground">Target</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!complete && <AddDepositForm goal={goal} />}
        </div>

        {/* Right column */}
        <DepositHistory goal={goal} />
      </div>
    </div>
  )
}

function CompleteHero({
  goal,
  saved,
}: {
  goal: { deadline?: string; deposits: unknown[] }
  saved: number
}) {
  const count = goal.deposits.length
  return (
    <div className="rounded-2xl bg-linear-to-br from-red-700 via-orange-600 to-orange-500 p-6 text-white">
      <span className="flex size-10 items-center justify-center rounded-full bg-white/20">
        <Check className="size-5" />
      </span>
      <p className="mt-4 text-5xl font-bold tracking-tight">100%</p>
      <p className="mt-1 text-lg font-semibold">Goal Complete</p>
      <p className="mt-2 text-sm text-white/80">
        You saved {money.format(saved)} across {count} {count === 1 ? "deposit" : "deposits"}.
        {goal.deadline &&
          ` Finished before your ${dateFormat.format(new Date(goal.deadline))} deadline.`}
      </p>
      <div className="mt-6 flex gap-10">
        <div>
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-xs tracking-wide text-white/70 uppercase">Deposits</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{money.format(saved)}</p>
          <p className="text-xs tracking-wide text-white/70 uppercase">Total saved</p>
        </div>
      </div>
    </div>
  )
}
