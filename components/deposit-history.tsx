import { ArrowDown } from "lucide-react"

import type { Goal } from "@/types"

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

export default function DepositHistory({ goal }: { goal: Goal }) {
  // Most recent first.
  const deposits = [...goal.deposits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-foreground">Deposit history</h2>
        <span className="text-sm text-muted-foreground">
          {deposits.length} {deposits.length === 1 ? "deposit" : "deposits"}
        </span>
      </div>

      {deposits.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No deposits yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {deposits.map((deposit) => (
            <li key={deposit.id} className="flex items-center gap-3 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ArrowDown className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                {deposit.note ? (
                  <>
                    <p className="truncate text-sm font-medium text-foreground">{deposit.note}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateFormat.format(new Date(deposit.createdAt))}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {dateFormat.format(new Date(deposit.createdAt))}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm font-semibold text-emerald-400">
                +{money.format(deposit.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
