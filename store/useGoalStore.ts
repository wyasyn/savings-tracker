"use client"

import {
  createContext,
  createElement,
  useContext,
  useRef,
  type ReactNode,
} from "react"
import { createStore, useStore } from "zustand"

import { Deposit, Goal } from "@/types"
import {
  addDeposit as addDepositAction,
  createGoal as createGoalAction,
  deleteGoal as deleteGoalAction,
  updateGoal as updateGoalAction,
} from "@/app/(main)/actions"

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

interface GoalState {
  goals: Goal[]
  addGoal: (goal: Goal) => void
  removeGoal: (id: string) => void
  updateGoal: (id: string, goal: Goal) => void
  getGoal: (id: string) => Goal | undefined
  addDeposit: (goalId: string, amount: number, note?: string, channel?: string) => void
  filterByStatus: (status: GoalStatus) => Goal[]
  sortBy: (field: SortField, order: SortOrder) => Goal[]
}

type GoalStoreApi = ReturnType<typeof createGoalStore>

/**
 * Each request gets its own store seeded with the user's goals from the server.
 * Mutations update local state optimistically and persist via server actions.
 */
function createGoalStore(initialGoals: Goal[]) {
  return createStore<GoalState>((set, get) => ({
    goals: initialGoals,

    addGoal: (goal) => {
      set((state) => ({ goals: [...state.goals, goal] }))
      void createGoalAction({
        id: goal.id,
        name: goal.name,
        target: goal.target,
        deadline: goal.deadline,
        createdAt: goal.createdAt,
      })
    },

    removeGoal: (id) => {
      set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) }))
      void deleteGoalAction(id)
    },

    updateGoal: (id, goal) => {
      set((state) => ({ goals: state.goals.map((g) => (g.id === id ? goal : g)) }))
      void updateGoalAction({
        id: goal.id,
        name: goal.name,
        target: goal.target ?? null,
        deadline: goal.deadline ?? null,
      })
    },

    getGoal: (id) => get().goals.find((goal) => goal.id === id),

    addDeposit: (goalId, amount, note, channel) => {
      const deposit: Deposit = {
        id: crypto.randomUUID(),
        amount,
        createdAt: new Date().toISOString(),
        ...(note ? { note } : {}),
        ...(channel ? { channel } : {}),
      }
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, deposits: [...g.deposits, deposit] } : g
        ),
      }))
      void addDepositAction({
        id: deposit.id,
        goalId,
        amount,
        note,
        channel,
        createdAt: deposit.createdAt,
      })
    },

    filterByStatus: (status) => filterGoalsByStatus(get().goals, status),
    sortBy: (field, order) => sortGoals(get().goals, field, order),
  }))
}

const GoalStoreContext = createContext<GoalStoreApi | null>(null)

export function GoalStoreProvider({
  goals,
  children,
}: {
  goals: Goal[]
  children: ReactNode
}) {
  const storeRef = useRef<GoalStoreApi | null>(null)
  if (!storeRef.current) {
    storeRef.current = createGoalStore(goals)
  }
  return createElement(GoalStoreContext.Provider, { value: storeRef.current }, children)
}

export function useGoalStore<T>(selector: (state: GoalState) => T): T {
  const store = useContext(GoalStoreContext)
  if (!store) {
    throw new Error("useGoalStore must be used within a GoalStoreProvider")
  }
  return useStore(store, selector)
}
