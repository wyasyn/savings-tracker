import { Deposit, Goal } from "@/types"
import { create } from "zustand"
import data from "@/data/data.json"

export type GoalStatus = "all" | "in-progress" | "completed" | "not-started"
export type SortField = "name" | "target" | "deadline" | "createdAt" | "progress" | "saved"
export type SortOrder = "asc" | "desc"

export const totalSaved = (goal: Goal) => goal.deposits.reduce((sum, d) => sum + d.amount, 0)

export const progressOf = (goal: Goal) => totalSaved(goal) / (goal.target ?? Infinity)

export const isCompleted = (goal: Goal) =>
  goal.target !== undefined && totalSaved(goal) >= goal.target

/** Derived lifecycle status of a single goal (excludes the "all" filter). */
export const getGoalStatus = (goal: Goal): Exclude<GoalStatus, "all"> => {
  if (goal.deposits.length === 0) return "not-started"
  if (isCompleted(goal)) return "completed"
  return "in-progress"
}

/** Pure, composable filter — reused by the store method and the goals section. */
export const filterGoalsByStatus = (goals: Goal[], status: GoalStatus): Goal[] =>
  status === "all" ? goals : goals.filter((goal) => getGoalStatus(goal) === status)

/** Pure, composable sort — returns a new array, never mutates the input. */
export const sortGoals = (goals: Goal[], field: SortField, order: SortOrder): Goal[] => {
  const direction = order === "asc" ? 1 : -1
  return [...goals].sort((a, b) => {
    let comparison: number
    switch (field) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "target":
        comparison = (a.target ?? 0) - (b.target ?? 0)
        break
      case "saved":
        comparison = totalSaved(a) - totalSaved(b)
        break
      case "progress":
        comparison = progressOf(a) - progressOf(b)
        break
      case "deadline":
        // Goals without a deadline sort last regardless of order.
        if (!a.deadline && !b.deadline) comparison = 0
        else if (!a.deadline) return 1
        else if (!b.deadline) return -1
        else comparison = a.deadline.localeCompare(b.deadline)
        break
      case "createdAt":
        comparison = a.createdAt.localeCompare(b.createdAt)
        break
    }
    return comparison * direction
  })
}

interface GoalStore {
  goals: Goal[]
  addGoal: (goal: Goal) => void
  removeGoal: (id: string) => void
  updateGoal: (id: string, goal: Goal) => void
  getGoal: (id: string) => Goal | undefined
  addDeposit: (goalId: string, amount: number, note?: string) => void
  filterByStatus: (status: GoalStatus) => Goal[]
  sortBy: (field: SortField, order: SortOrder) => Goal[]
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: data.goals as Goal[],
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  removeGoal: (id) => set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) })),
  updateGoal: (id, goal) =>
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? goal : g)) })),
  getGoal: (id) => get().goals.find((goal) => goal.id === id),
  addDeposit: (goalId, amount, note) =>
    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.id !== goalId) return g
        const deposit: Deposit = {
          id: crypto.randomUUID(),
          amount,
          createdAt: new Date().toISOString(),
          ...(note ? { note } : {}),
        }
        return { ...g, deposits: [...g.deposits, deposit] }
      }),
    })),
  filterByStatus: (status) => filterGoalsByStatus(get().goals, status),
  sortBy: (field, order) => sortGoals(get().goals, field, order),
}))
