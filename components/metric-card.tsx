import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
}

export function MetricCard({ title, value, change, changeType = "neutral" }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {changeType === "positive" && <ArrowUpIcon className="h-4 w-4 text-emerald-500" />}
        {changeType === "negative" && <ArrowDownIcon className="h-4 w-4 text-rose-500" />}
        {changeType === "neutral" && <MinusIcon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs",
              changeType === "positive" && "text-emerald-500",
              changeType === "negative" && "text-rose-500",
              changeType === "neutral" && "text-muted-foreground",
            )}
          >
            {change} from previous period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
