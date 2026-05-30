"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import type { MonthlyDeposit } from "@/hooks/useMonthlyDeposits"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const amountFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const chartConfig = {
  total: {
    label: "Deposited",
    // Your orange — Tailwind's orange-500.
    color: "#f97316",
  },
} satisfies ChartConfig

type MonthlyDepositsChartProps = {
  /** Buckets to plot, in the order they should appear left → right. */
  data: MonthlyDeposit[]
  title?: string
  className?: string
}

export default function MonthlyDepositsChart({
  data,
  title = "Monthly deposits",
  className,
}: MonthlyDepositsChartProps) {
  const max = Math.max(...data.map((d) => d.total), 0)
  const total = data.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <Card className={cn("mt-4 md:mt-8 lg:mt-12", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {amountFormat.format(total)} deposited this year
        </CardDescription>
      </CardHeader>
      <CardContent>
        {max === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No deposits yet
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="total"
                    formatter={(value) => amountFormat.format(Number(value))}
                  />
                }
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
