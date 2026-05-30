"use client"
import { useMonthlyDeposits } from "@/hooks/useMonthlyDeposits"
import MonthlyDepositsChart from "./monthly-deposits-chart"

type MonthlyDepositsProps = {
  /** Year to chart. Defaults to the current year. */
  year?: number
}

export default function MonthlyDeposits({ year }: MonthlyDepositsProps) {
  // The hook returns latest month first; the chart reads oldest → newest.
  const data = [...useMonthlyDeposits(year)].reverse()
  return <MonthlyDepositsChart data={data} />
}
