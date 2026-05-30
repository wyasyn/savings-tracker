"use client"

import { useState } from "react"
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  CalendarIcon,
  CheckIcon,
  PlusIcon,
  TargetIcon,
  XIcon,
} from "lucide-react"
import { Separator } from "./ui/separator"
import { totalSaved, useGoalStore } from "@/store/useGoalStore"
import type { Goal } from "@/types"

type FormErrors = {
  name?: string
  target?: string
}

function validateForm(
  data: { name: string; target: string },
  minTarget = 0
): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = "Goal name is required."
  }

  const trimmedTarget = data.target.trim()
  if (trimmedTarget) {
    const amount = Number(trimmedTarget)
    if (Number.isNaN(amount) || amount <= 0) {
      errors.target = "Enter a valid amount greater than 0."
    } else if (amount < minTarget) {
      errors.target = `Target can't be below the ${minTarget} already saved.`
    }
  }

  return errors
}

type GoalFormDialogProps = {
  mode?: "create" | "edit"
  goal?: Goal
  trigger?: React.ReactNode
}

export function GoalFormDialog({ mode = "create", goal, trigger }: GoalFormDialogProps) {
  const addGoal = useGoalStore((state) => state.addGoal)
  const updateGoal = useGoalStore((state) => state.updateGoal)

  const isEdit = mode === "edit"
  const savedSoFar = goal ? totalSaved(goal) : 0

  const [open, setOpen] = useState(false)
  const [name, setName] = useState(goal?.name ?? "")
  const [target, setTarget] = useState(goal?.target?.toString() ?? "")
  const [deadline, setDeadline] = useState(goal?.deadline ?? "")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function resetForm() {
    setName(goal?.name ?? "")
    setTarget(goal?.target?.toString() ?? "")
    setDeadline(goal?.deadline ?? "")
    setErrors({})
    setSubmitted(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    // Reset to the source values whenever the dialog opens or closes.
    resetForm()
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const formErrors = validateForm({ name, target }, isEdit ? savedSoFar : 0)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    const trimmedName = name.trim()
    const targetValue = target.trim() ? Number(target) : undefined

    if (isEdit && goal) {
      updateGoal(goal.id, {
        ...goal,
        name: trimmedName,
        target: targetValue,
        deadline: deadline || undefined,
      })
    } else {
      addGoal({
        id: crypto.randomUUID(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
        deposits: [],
        ...(targetValue !== undefined && { target: targetValue }),
        ...(deadline && { deadline }),
      })
    }

    setOpen(false)
  }

  function openDatePicker(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) {
      return
    }
    const input = event.currentTarget.parentElement?.querySelector("input")
    input?.focus()
    input?.showPicker?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="h-9 cursor-pointer gap-2 rounded-full bg-orange-600 px-3 text-white hover:bg-orange-700">
            <PlusIcon data-icon="inline-start" />
            <span>New goal</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Goal" : "New Goal"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of your savings goal."
              : "Create a new goal to track your savings."}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field data-invalid={submitted && !!errors.name}>
              <FieldLabel htmlFor="goal-name">Goal Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>
                    <TargetIcon />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="goal-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. MacBook Pro M4"
                  aria-invalid={submitted && !!errors.name}
                />
              </InputGroup>
              {submitted && errors.name && (
                <FieldError>{errors.name}</FieldError>
              )}
            </Field>

            <Field data-invalid={submitted && !!errors.target}>
              <FieldLabel htmlFor="goal-target">Target Amount</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>UGX</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="goal-target"
                  name="target"
                  type="number"
                  min="0"
                  step="0.01"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="e.g. 2499"
                  aria-invalid={submitted && !!errors.target}
                />
              </InputGroup>
              {submitted && errors.target && (
                <FieldError>{errors.target}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="goal-deadline">
                Deadline (Optional)
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon onClick={openDatePicker}>
                  <InputGroupText>
                    <CalendarIcon />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="goal-deadline"
                  name="deadline"
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-moz-calendar-picker-indicator]:hidden"
                />
              </InputGroup>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-9 cursor-pointer gap-2 rounded-full px-3"
              >
                <XIcon data-icon="inline-start" />
                <span>Cancel</span>
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="h-9 cursor-pointer gap-2 rounded-full bg-orange-600 px-3 text-white hover:bg-orange-700"
            >
              {isEdit ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              <span>{isEdit ? "Save Changes" : "Create Goal"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function NewGoalButton({ trigger }: { trigger?: React.ReactNode } = {}) {
  return <GoalFormDialog mode="create" trigger={trigger} />
}

export function EditGoalButton({ goal, trigger }: { goal: Goal; trigger?: React.ReactNode }) {
  return <GoalFormDialog mode="edit" goal={goal} trigger={trigger} />
}
