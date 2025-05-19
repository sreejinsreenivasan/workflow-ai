import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, BarChart } from "lucide-react"

interface WorkflowCardProps {
  id: string
  name: string
  status: "active" | "completed" | "failed" | "paused"
  lastRun: string
  runCount: number
  description?: string
  tags?: string[]
  variant?: "card" | "list"
}

export function WorkflowCard({
  id,
  name,
  status,
  lastRun,
  runCount,
  description,
  tags,
  variant = "card",
}: WorkflowCardProps) {
  const statusColors = {
    active: "bg-emerald-500",
    completed: "bg-blue-500",
    failed: "bg-rose-500",
    paused: "bg-amber-500",
  }

  if (variant === "list") {
    return (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center space-x-4">
          <div className={`h-3 w-3 rounded-full ${statusColors[status]}`} />
          <div>
            <h3 className="font-medium">{name}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden items-center space-x-2 md:flex">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{lastRun}</span>
          </div>
          <div className="hidden items-center space-x-2 md:flex">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{runCount} runs</span>
          </div>
          <Button size="sm" asChild>
            <Link href={`/workflow/${id}`}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Run
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>}
        <div className="flex flex-wrap gap-1">
          {tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{lastRun}</span>
          </div>
          <div className="flex items-center">
            <BarChart className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{runCount} runs</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm" asChild>
          <Link href={`/workflow/${id}`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Run Workflow
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
