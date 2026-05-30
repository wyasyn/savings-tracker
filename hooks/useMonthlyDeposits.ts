import { useMemo } from "react"
import { useGoalStore } from "@/store/useGoalStore"

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export interface MonthlyDeposit {
  /** Calendar month, 1 (Jan) – 12 (Dec). */
  month: number
  /** Short month name, e.g. "Jan". */
  label: string
  /** Four-digit year the bucket belongs to. */
  year: number
  /** Total amount deposited across all goals in this month. */
  total: number
}

/**
 * Total deposited per month across every goal for the given `year`, ordered
 * latest month first for a bar graph. Months run from January up to the
 * current month (for the current year) or December (for past years); future
 * years return no months. Empty months in range are 0.
 *
 * @param year Four-digit year to aggregate. Defaults to the current year.
 */
export function useMonthlyDeposits(year: number = new Date().getFullYear()): MonthlyDeposit[] {
  const goals = useGoalStore((state) => state.goals)

  return useMemo(() => {
    const now = new Date()
    // Last month to include: current month for this year, December for past
    // years, and nothing for future years.
    const lastMonthIndex =
      year > now.getFullYear() ? -1 : year < now.getFullYear() ? 11 : now.getMonth()

    const totals = new Array<number>(lastMonthIndex + 1).fill(0)

    for (const goal of goals) {
      for (const deposit of goal.deposits) {
        const date = new Date(deposit.createdAt)
        if (date.getFullYear() === year && date.getMonth() <= lastMonthIndex) {
          totals[date.getMonth()] += deposit.amount
        }
      }
    }

    return totals
      .map((total, index) => ({
        month: index + 1,
        label: MONTH_LABELS[index],
        year,
        total,
      }))
      .reverse() // latest month first
  }, [goals, year])
}
