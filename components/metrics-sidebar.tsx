"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, BarChart2, Globe } from "lucide-react"

interface MetricsSidebarProps {
  startTime: Date
  estimatedTotalTime: number
  metrics: {
    apiCalls: number
    apiSuccessRate: number
    throughput: number
  }
}

export function MetricsSidebar({ startTime, estimatedTotalTime, metrics }: MetricsSidebarProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [elapsedPercent, setElapsedPercent] = useState(0)

  // Update elapsed time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date()
      const elapsed = now.getTime() - startTime.getTime()
      setElapsedTime(elapsed)
      setElapsedPercent(Math.min(100, (elapsed / estimatedTotalTime) * 100))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [startTime, estimatedTotalTime])

  // Format time in minutes and seconds
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Workflow Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Time Progress</span>
            </div>
            <span className="text-sm">
              {formatTime(elapsedTime)} / {formatTime(estimatedTotalTime)}
            </span>
          </div>
          <Progress value={elapsedPercent} className="h-2" />
        </div>

        {/* API metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">API Calls</span>
            </div>
            <span className="text-sm">{metrics.apiCalls}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">API Success Rate</span>
            </div>
            <span className="text-sm">{metrics.apiSuccessRate}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Throughput</span>
            </div>
            <span className="text-sm">{metrics.throughput.toFixed(1)} steps/min</span>
          </div>
        </div>

        {/* Timeline chart */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Runs Comparison</h3>
          <div className="h-24 bg-muted rounded-md p-2">
            <div className="flex h-full items-end space-x-1">
              <div className="bg-blue-500 w-6 h-40%" title="Run 1: 2m 30s" />
              <div className="bg-blue-500 w-6 h-60%" title="Run 2: 3m 45s" />
              <div className="bg-blue-500 w-6 h-50%" title="Run 3: 3m 10s" />
              <div className="bg-blue-500 w-6 h-45%" title="Run 4: 2m 50s" />
              <div className="bg-blue-600 w-6 h-[calc(var(--elapsed-percent)%)]" title="Current run" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-center">Average completion time: 3m 5s</div>
        </div>
      </CardContent>
    </Card>
  )
}
