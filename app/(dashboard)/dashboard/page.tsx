import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card"
import { WorkflowCard } from "@/components/workflow-card"
import { PlusCircle, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard | Workflow Management App",
  description: "Overview of your workflows and key metrics",
}

// Mock data for demonstration
const metrics = [
  { title: "Runs Today", value: "24", change: "+12%", changeType: "positive" },
  { title: "Avg. Completion Time", value: "1.2s", change: "-0.3s", changeType: "positive" },
  { title: "Success Rate", value: "98%", change: "+2%", changeType: "positive" },
  { title: "Active Workflows", value: "12", change: "+3", changeType: "positive" },
]

const recentWorkflows = [
  { id: "1", name: "Customer Onboarding", status: "active", lastRun: "2 hours ago", runCount: 45 },
  { id: "2", name: "Invoice Processing", status: "completed", lastRun: "5 hours ago", runCount: 32 },
  { id: "3", name: "Data Validation", status: "failed", lastRun: "1 day ago", runCount: 18 },
  { id: "4", name: "Email Campaign", status: "paused", lastRun: "3 days ago", runCount: 27 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your workflows and key metrics</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/builder">
              <PlusCircle className="mr-2 h-4 w-4" />
              Build with AI
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/library">
              <BookOpen className="mr-2 h-4 w-4" />
              View Library
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType as "positive" | "negative" | "neutral"}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workflows</CardTitle>
          <CardDescription>Your most recently used workflows and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                id={workflow.id}
                name={workflow.name}
                status={workflow.status as "active" | "completed" | "failed" | "paused"}
                lastRun={workflow.lastRun}
                runCount={workflow.runCount}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <Link href="/library">View all workflows</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
