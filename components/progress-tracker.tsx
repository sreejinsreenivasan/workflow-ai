"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "failed"
  startTime?: Date
  endTime?: Date
  estimatedDuration?: number
}

interface ProgressTrackerProps {
  steps: Step[]
}

export function ProgressTracker({ steps }: ProgressTrackerProps) {
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({})

  // Update time remaining for running steps
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimeRemaining: Record<string, string> = {}

      steps.forEach((step) => {
        if (step.status === "running" && step.startTime && step.estimatedDuration) {
          const elapsedMs = Date.now() - step.startTime.getTime()
          const remainingMs = Math.max(0, step.estimatedDuration - elapsedMs)

          if (remainingMs > 0) {
            const remainingSec = Math.ceil(remainingMs / 1000)
            if (remainingSec < 60) {
              newTimeRemaining[step.id] = `${remainingSec}s remaining`
            } else {
              newTimeRemaining[step.id] = `~${Math.ceil(remainingSec / 60)}m remaining`
            }
          } else {
            newTimeRemaining[step.id] = "Completing soon..."
          }
        }
      })

      setTimeRemaining(newTimeRemaining)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [steps])

  // Get step status icon
  const getStepIcon = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />
      case "running":
        return <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      case "failed":
        return <Circle className="h-6 w-6 text-red-500" />
      default:
        return <Circle className="h-6 w-6 text-gray-300" />
    }
  }

  return (
    <div className="w-full">
      {/* Desktop view - horizontal */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2" />

          {/* Completed progress */}
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 transition-all duration-500"
            style={{
              width: `${(steps.filter((step) => step.status === "completed").length / (steps.length - 1)) * 100}%`,
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn("flex flex-col items-center", step.status === "running" && "animate-pulse")}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 z-10">
                  {getStepIcon(step.status)}
                </div>
                <div className="mt-2 text-center">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {step.status === "completed" && "Completed"}
                    {step.status === "running" && (
                      <span className="text-blue-500 font-medium">{timeRemaining[step.id] || "In progress"}</span>
                    )}
                    {step.status === "pending" && "Pending"}
                    {step.status === "failed" && <span className="text-red-500">Failed</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view - vertical */}
      <div className="sm:hidden">
        <div className="relative pl-8">
          {/* Vertical progress bar */}
          <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-200" />

          {/* Completed progress */}
          <div
            className="absolute top-0 left-4 w-0.5 bg-blue-500 transition-all duration-500"
            style={{
              height: `${
                (steps.filter((step) => step.status === "completed" || step.status === "running").length /
                  steps.length) *
                100
              }%`,
            }}
          />

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div
                  className={cn(
                    "absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 z-10 -translate-x-4",
                    step.status === "running" && "animate-pulse",
                  )}
                >
                  {getStepIcon(step.status)}
                </div>
                <div>
                  <div className="font-medium">{step.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {step.status === "completed" && "Completed"}
                    {step.status === "running" && (
                      <span className="text-blue-500 font-medium">{timeRemaining[step.id] || "In progress"}</span>
                    )}
                    {step.status === "pending" && "Pending"}
                    {step.status === "failed" && <span className="text-red-500">Failed</span>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
