"use client"
import { useGoalStats } from "@/hooks/useGoalStats"
import StatCard from "./stat-card"



const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export default function Stats() {
  const { totalSavings, activeGoals, completedGoals } = useGoalStats()
  return (
    <section className="flex gap-4 flex-wrap">
      <StatCard main title="Total Savings" value={currency.format(totalSavings)} />
      <StatCard title="Active Goals" value={activeGoals} accent="orange" />
      <StatCard title="Completed Goals" value={completedGoals} accent="green" />
    </section>
  )
}
