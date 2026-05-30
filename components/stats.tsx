"use client"
import { useGoalStats } from "@/hooks/useGoalStats"
import { useMoney } from "@/components/providers/profile-provider"
import StatCard from "./stat-card"

export default function Stats() {
  const { totalSavings, activeGoals, completedGoals } = useGoalStats()
  const money = useMoney()
  return (
    <section className="flex gap-4 flex-wrap">
      <StatCard main title="Total Savings" value={money.format(totalSavings)} />
      <StatCard title="Active Goals" value={activeGoals} accent="orange" />
      <StatCard title="Completed Goals" value={completedGoals} accent="green" />
    </section>
  )
}
