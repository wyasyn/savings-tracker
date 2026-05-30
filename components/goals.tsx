"use client"

import { useMemo, useState } from "react"

import Link from "next/link"
import { Plus, Target } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  filterGoalsByStatus,
  sortGoals,
  useGoalStore,
  type GoalStatus,
} from "@/store/useGoalStore"
import { Button } from "@/components/ui/button"
import { NewGoalButton } from "./new-goal-button"
import GoalCard, { type GoalCardSize } from "./goal-card"
import GoalControls, { SORT_CONFIG, type SortKey } from "./goal-controls"

// Repeating bento pattern: a wide hero, an occasional tall card, rest default.
function sizeForIndex(index: number): GoalCardSize {
  const position = index % 6
  if (position === 0) return "wide"
  if (position === 4) return "tall"
  return "default"
}

const spanClass: Record<GoalCardSize, string> = {
  default: "",
  wide: "sm:col-span-2",
  tall: "row-span-2",
}

export default function Goals() {
  const goals = useGoalStore((state) => state.goals)
  const [status, setStatus] = useState<GoalStatus>("all")
  const [sort, setSort] = useState<SortKey>("recent")

  const visibleGoals = useMemo(() => {
    const { field, order } = SORT_CONFIG[sort]
    return sortGoals(filterGoalsByStatus(goals, status), field, order)
  }, [goals, status, sort])

  return (
    <section className="mt-8 md:mt-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Your goals</h2>
        <GoalControls
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed px-6 py-20 text-center">
          <Target className="size-10 text-muted-foreground/60" strokeWidth={1.5} />
          <p className="max-w-xs text-sm text-muted-foreground">
            Start saving for something that matters. Create your first goal and track your
            progress.
          </p>
          <NewGoalButton
            trigger={
              <Button className="h-10 cursor-pointer gap-2 rounded-full bg-orange-600 px-5 text-white hover:bg-orange-700">
                <Plus data-icon="inline-start" />
                <span>Create your first goal</span>
              </Button>
            }
          />
        </div>
      ) : visibleGoals.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
          No goals match this filter.
        </div>
      ) : (
        <div className="grid auto-rows-[210px] grid-flow-row-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleGoals.map((goal, index) => {
            const size = sizeForIndex(index)
            return (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className={cn(
                  "block h-full rounded-2xl transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  spanClass[size]
                )}
              >
                <GoalCard goal={goal} size={size} />
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
