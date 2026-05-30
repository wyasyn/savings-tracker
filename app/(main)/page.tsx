import Goals from "@/components/goals";
import MonthlyDeposits from "@/components/monthly-deposits";
import Stats from "@/components/stats";


export default function HomePage() {
  return (
          <div>
            <Stats />
            <MonthlyDeposits />
            <Goals />
          </div>
  )
}
