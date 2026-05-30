import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Accent = "orange" | "green"

type StatCardProps = {
  title: string
  value: number | string
  /** Highlighted gradient card with a large white value (e.g. total savings). */
  main?: boolean
  /** Value text color for standard cards. Ignored when `main`. */
  accent?: Accent
}

const accentText: Record<Accent, string> = {
  orange: "text-orange-500",
  green: "text-emerald-400",
}

export default function StatCard({ title, value, main = false, accent = "orange" }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl p-6 min-w-[250px]",
        main
          ? "flex-2 bg-linear-to-r from-red-700 via-orange-600 to-orange-500 text-white"
          : "flex-1 bg-card border"
      )}
    >
      <ArrowDown
        aria-hidden
        strokeWidth={2.5}
        className={cn(
          "pointer-events-none absolute -bottom-4 right-2 -z-10 size-32",
          main ? "text-black/10" : "text-foreground/4"
        )}
      />
      <h3 className={cn("text-sm font-medium", main ? "text-white/90" : "text-muted-foreground")}>
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 font-bold tracking-tight",
          main ? "text-5xl" : cn("text-4xl", accentText[accent])
        )}
      >
        {value}
      </p>
    </div>
  )
}
