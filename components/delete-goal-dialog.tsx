"use client"

import { useRouter } from "next/navigation"

import type { Goal } from "@/types"
import { useGoalStore } from "@/store/useGoalStore"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DeleteGoalDialog({ goal }: { goal: Goal }) {
  const router = useRouter()
  const removeGoal = useGoalStore((state) => state.removeGoal)

  function handleDelete() {
    removeGoal(goal.id)
    router.push("/")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer text-sm font-medium text-destructive transition-opacity hover:opacity-80">
          Delete goal
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {goal.name}?</DialogTitle>
          <DialogDescription>
            This will permanently delete this goal and all its deposit history. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="h-9 rounded-full px-4">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleDelete}
            className="h-9 rounded-full bg-red-500 px-4 text-white hover:bg-red-600"
          >
            Delete goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
