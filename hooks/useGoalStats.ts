import { useMemo } from "react"
import { isCompleted, totalSaved, useGoalStore } from "@/store/useGoalStore"

interface GoalStats {
  /** Sum of every deposit across all goals. */
  totalSavings: number
  /** Goals not yet completed (still being saved toward). */
  activeGoals: number
  /** Goals whose saved amount has reached their target. */
  completedGoals: number
  /** Total number of goals. */
  totalGoals: number
}

/**
 * Aggregate dashboard stats derived from the goal store. Recomputed only when
 * the underlying `goals` array changes (e.g. after adding a deposit or goal).
 */
export function useGoalStats(): GoalStats {
  const goals = useGoalStore((state) => state.goals)

  return useMemo(() => {
    let totalSavings = 0
    let completedGoals = 0

    for (const goal of goals) {
      totalSavings += totalSaved(goal)
      if (isCompleted(goal)) completedGoals += 1
    }

    return {
      totalSavings,
      completedGoals,
      activeGoals: goals.length - completedGoals,
      totalGoals: goals.length,
    }
  }, [goals])
}
