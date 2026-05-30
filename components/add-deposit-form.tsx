"use client"

import { useState } from "react"

import type { Goal } from "@/types"
import { totalSaved, useGoalStore } from "@/store/useGoalStore"
import { useMoney, useProfile } from "@/components/providers/profile-provider"
import { SAVINGS_CHANNELS } from "@/lib/locale"
import { Button } from "@/components/ui/button"

export default function AddDepositForm({ goal }: { goal: Goal }) {
  const addDeposit = useGoalStore((state) => state.addDeposit)
  const money = useMoney()
  const profile = useProfile()

  // Offer the channels picked at onboarding; fall back to all if none stored.
  const channelOptions = profile.channels.length
    ? SAVINGS_CHANNELS.filter((c) => profile.channels.includes(c.value))
    : SAVINGS_CHANNELS

  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [channel, setChannel] = useState<string>(channelOptions[0]?.value ?? "")
  const [error, setError] = useState<string | null>(null)

  const saved = totalSaved(goal)
  const remaining = goal.target != null ? goal.target - saved : null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = Number(amount)
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      setError("Enter an amount greater than 0.")
      return
    }
    if (remaining != null && value > remaining) {
      setError(`That exceeds the ${money.format(remaining)} remaining for this goal.`)
      return
    }

    addDeposit(goal.id, value, note.trim() || undefined, channel || undefined)
    setAmount("")
    setNote("")
    setError(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-6"
      noValidate
    >
      <h2 className="text-lg font-semibold text-foreground">Add deposit</h2>

      <div className="mt-4 space-y-2">
        <label htmlFor="deposit-amount" className="text-sm font-medium text-foreground">
          Amount
        </label>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <span className="text-muted-foreground">{money.symbol}</span>
          <input
            id="deposit-amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              if (error) setError(null)
            }}
            placeholder="0.00"
            aria-invalid={!!error}
            className="h-11 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {channelOptions.length > 1 && (
        <div className="mt-4 space-y-2">
          <label htmlFor="deposit-channel" className="text-sm font-medium text-foreground">
            Channel
          </label>
          <select
            id="deposit-channel"
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            className="h-11 w-full rounded-lg border bg-muted/40 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {channelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <label htmlFor="deposit-note" className="text-sm font-medium text-foreground">
          Note (optional)
        </label>
        <input
          id="deposit-note"
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. Monthly savings"
          className="h-11 w-full rounded-lg border bg-muted/40 px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className="mt-6 h-12 w-full rounded-full bg-orange-600 text-base font-semibold text-white hover:bg-orange-700"
      >
        Add funds
      </Button>
    </form>
  )
}
