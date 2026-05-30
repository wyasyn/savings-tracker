"use client"

import { ArrowUpDown, ListFilter } from "lucide-react"

import type { GoalStatus, SortField, SortOrder } from "@/store/useGoalStore"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export type SortKey =
  | "recent"
  | "deadline"
  | "progress-desc"
  | "progress-asc"
  | "saved-desc"
  | "name"

export const SORT_CONFIG: Record<SortKey, { field: SortField; order: SortOrder }> = {
  recent: { field: "createdAt", order: "desc" },
  deadline: { field: "deadline", order: "asc" },
  "progress-desc": { field: "progress", order: "desc" },
  "progress-asc": { field: "progress", order: "asc" },
  "saved-desc": { field: "saved", order: "desc" },
  name: { field: "name", order: "asc" },
}

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "all", label: "All goals" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "not-started", label: "Not started" },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "deadline", label: "Deadline (soonest first)" },
  { value: "progress-desc", label: "Progress (highest first)" },
  { value: "progress-asc", label: "Progress (lowest first)" },
  { value: "saved-desc", label: "Amount saved (highest first)" },
  { value: "name", label: "Alphabetical (A–Z)" },
]

type GoalControlsProps = {
  status: GoalStatus
  onStatusChange: (status: GoalStatus) => void
  sort: SortKey
  onSortChange: (sort: SortKey) => void
}

function OptionList<T extends string>({
  heading,
  value,
  onChange,
  options,
}: {
  heading: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {heading}
      </p>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-3">
            <RadioGroupItem value={option.value} id={`${heading}-${option.value}`} />
            <Label htmlFor={`${heading}-${option.value}`} className="font-normal text-foreground">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default function GoalControls({
  status,
  onStatusChange,
  sort,
  onSortChange,
}: GoalControlsProps) {
  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2 rounded-full px-4">
            <ListFilter />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <OptionList
            heading="Filter by status"
            value={status}
            onChange={onStatusChange}
            options={STATUS_OPTIONS}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2 rounded-full px-4">
            <ArrowUpDown />
            Sort by
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <OptionList
            heading="Sort by"
            value={sort}
            onChange={onSortChange}
            options={SORT_OPTIONS}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
