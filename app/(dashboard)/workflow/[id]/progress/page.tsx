"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Pause, Play, XCircle, FileText, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ProgressTracker } from "@/components/progress-tracker"
import { LiveLogFeed } from "@/components/live-log-feed"
import { MetricsSidebar } from "@/components/metrics-sidebar"
import { StatusFooter } from "@/components/status-footer"
import type { WorkflowStatus } from "@/types/workflow"

// Mock workflow data
const mockWorkflow = {
  id: "72f3a4e",
  name: "Customer Onboarding",
  status: "running" as WorkflowStatus,
  startTime: new Date(Date.now() - 150000), // 2.5 minutes ago
  estimatedTotalTime: 240000, // 4 minutes
  steps: [
    {
      id: "step1",
      name: "Validate Input",
      description: "Validating customer information",
      status: "completed",
      startTime: new Date(Date.now() - 150000),
      endTime: new Date(Date.now() - 120000),
    },
    {
      id: "step2",
      name: "Upload Signature",
      description: "Uploading customer signature to secure storage",
      status: "completed",
      startTime: new Date(Date.now() - 120000),
      endTime: new Date(Date.now() - 30000),
    },
    {
      id: "step3",
      name: "Await Bank Response",
      description: "Waiting for bank verification API response",
      status: "running",
      startTime: new Date(Date.now() - 30000),
      estimatedDuration: 60000, // 1 minute
    },
    {
      id: "step4",
      name: "Aggregate Results",
      description: "Combining all verification results",
      status: "pending",
      estimatedDuration: 30000, // 30 seconds
    },
    {
      id: "step5",
      name: "Complete",
      description: "Finalizing customer onboarding",
      status: "pending",
      estimatedDuration: 15000, // 15 seconds
    },
  ],
  metrics: {
    apiCalls: 3,
    apiSuccessRate: 100,
    throughput: 1.2, // steps per minute
  },
  currentStepDetails: {
    id: "step3",
    name: "Await Bank Response",
    payload: {
      customerId: "CUST-12345",
      accountType: "checking",
      verificationLevel: "enhanced",
    },
    nextRetry: new Date(Date.now() + 15000), // 15 seconds from now
  },
  suggestions: [
    "If banking API stalls, check your credentials or retry manually.",
    "Ensure your network connection is stable for consistent API responses.",
  ],
}

// Initial logs
const initialLogs = [
  {
    timestamp: new Date(Date.now() - 150000),
    level: "INFO",
    message: "Starting workflow 'Customer Onboarding'",
  },
  {
    timestamp: new Date(Date.now() - 145000),
    level: "INFO",
    message: "Starting step 'Validate Input'",
  },
  {
    timestamp: new Date(Date.now() - 120000),
    level: "INFO",
    message: "Step 'Validate Input' completed successfully",
  },
  {
    timestamp: new Date(Date.now() - 119000),
    level: "INFO",
    message: "Starting step 'Upload Signature'",
  },
  {
    timestamp: new Date(Date.now() - 30000),
    level: "INFO",
    message: "Signature upload succeeded",
  },
  {
    timestamp: new Date(Date.now() - 29000),
    level: "INFO",
    message: "Step 'Upload Signature' completed successfully",
  },
  {
    timestamp: new Date(Date.now() - 28000),
    level: "INFO",
    message: "Starting step 'Await Bank Response'",
  },
  {
    timestamp: new Date(Date.now() - 25000),
    level: "INFO",
    message: "Sending request to bank verification API",
  },
]

export default function WorkflowProgressPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [workflow, setWorkflow] = useState(mockWorkflow)
  const [logs, setLogs] = useState(initialLogs)
  const [isPaused, setIsPaused] = useState(false)
  const [activeTab, setActiveTab] = useState("logs")
  const wsRef = useRef<WebSocket | null>(null)

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    // In a real app, you would connect to a WebSocket server
    // For now, we'll simulate updates with setInterval

    if (isPaused) return

    const intervalId = setInterval(() => {
      // Update workflow status
      setWorkflow((prev) => {
        const now = new Date()
        const elapsedTime = now.getTime() - prev.startTime.getTime()

        // If workflow is complete, clear interval
        if (prev.status === "completed" || prev.status === "failed") {
          clearInterval(intervalId)
          return prev
        }

        // Update current step status
        const updatedSteps = [...prev.steps]
        const currentStepIndex = updatedSteps.findIndex((step) => step.status === "running")

        if (currentStepIndex >= 0) {
          const currentStep = updatedSteps[currentStepIndex]
          const stepElapsedTime = now.getTime() - currentStep.startTime.getTime()

          // If step is complete, move to next step
          if (currentStep.estimatedDuration && stepElapsedTime > currentStep.estimatedDuration) {
            // Mark current step as completed
            updatedSteps[currentStepIndex] = {
              ...currentStep,
              status: "completed",
              endTime: now,
            }

            // Start next step if available
            if (currentStepIndex < updatedSteps.length - 1) {
              updatedSteps[currentStepIndex + 1] = {
                ...updatedSteps[currentStepIndex + 1],
                status: "running",
                startTime: now,
              }

              // Add log entry for step completion and next step start
              setLogs((prevLogs) => [
                ...prevLogs,
                {
                  timestamp: now,
                  level: "INFO",
                  message: `Step '${currentStep.name}' completed successfully`,
                },
                {
                  timestamp: new Date(now.getTime() + 1000),
                  level: "INFO",
                  message: `Starting step '${updatedSteps[currentStepIndex + 1].name}'`,
                },
              ])

              // Update current step details
              return {
                ...prev,
                steps: updatedSteps,
                currentStepDetails: {
                  id: updatedSteps[currentStepIndex + 1].id,
                  name: updatedSteps[currentStepIndex + 1].name,
                  payload: {
                    ...prev.currentStepDetails.payload,
                    stepIndex: currentStepIndex + 1,
                  },
                  nextRetry: null,
                },
              }
            } else {
              // All steps completed
              setLogs((prevLogs) => [
                ...prevLogs,
                {
                  timestamp: now,
                  level: "INFO",
                  message: `Step '${currentStep.name}' completed successfully`,
                },
                {
                  timestamp: new Date(now.getTime() + 1000),
                  level: "INFO",
                  message: "Workflow completed successfully",
                },
              ])

              return {
                ...prev,
                status: "completed",
                steps: updatedSteps,
              }
            }
          }

          // Occasionally add log entries for the current step
          if (Math.random() > 0.7) {
            const messages = [
              `Processing data for ${prev.currentStepDetails.payload.customerId}`,
              `Waiting for external API response`,
              `Verifying customer information`,
              `Checking account status`,
            ]

            setLogs((prevLogs) => [
              ...prevLogs,
              {
                timestamp: now,
                level: "INFO",
                message: messages[Math.floor(Math.random() * messages.length)],
              },
            ])
          }

          // Occasionally simulate warnings
          if (Math.random() > 0.9) {
            setLogs((prevLogs) => [
              ...prevLogs,
              {
                timestamp: now,
                level: "WARN",
                message: "API response time is slower than expected",
              },
            ])
          }
        }

        return prev
      })
    }, 3000)

    return () => clearInterval(intervalId)
  }, [isPaused])

  // Handle pause/resume
  const handlePauseResume = () => {
    setIsPaused(!isPaused)

    toast({
      title: isPaused ? "Workflow resumed" : "Workflow paused",
      description: isPaused ? "The workflow execution has been resumed." : "The workflow execution has been paused.",
    })
  }

  // Handle cancel
  const handleCancel = () => {
    // Show confirmation dialog
    if (confirm("Are you sure you want to cancel this workflow? This action cannot be undone.")) {
      setWorkflow((prev) => ({
        ...prev,
        status: "cancelled",
      }))

      setLogs((prevLogs) => [
        ...prevLogs,
        {
          timestamp: new Date(),
          level: "WARN",
          message: "Workflow cancelled by user",
        },
      ])

      toast({
        title: "Workflow cancelled",
        description: "The workflow execution has been cancelled.",
      })
    }
  }

  // Handle retry
  const handleRetry = () => {
    if (workflow.status === "failed") {
      setWorkflow((prev) => ({
        ...prev,
        status: "running",
      }))

      setLogs((prevLogs) => [
        ...prevLogs,
        {
          timestamp: new Date(),
          level: "INFO",
          message: "Retrying workflow execution",
        },
      ])

      toast({
        title: "Workflow retried",
        description: "The workflow execution has been retried.",
      })
    } else {
      // Retry current step
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          timestamp: new Date(),
          level: "INFO",
          message: `Retrying step '${workflow.currentStepDetails.name}'`,
        },
      ])

      toast({
        title: "Step retried",
        description: `The step '${workflow.currentStepDetails.name}' has been retried.`,
      })
    }
  }

  // Get status badge color
  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case "running":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "cancelled":
        return "bg-amber-500"
      case "paused":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Bar: Context & Quick Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/workflow/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Workflow</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
              <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">ID: {workflow.id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handlePauseResume}
            disabled={workflow.status !== "running" && workflow.status !== "paused"}
          >
            {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={workflow.status !== "running" && workflow.status !== "paused"}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/workflow/${params.id}/logs`}>
              <FileText className="mr-2 h-4 w-4" />
              View Full Logs
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress Tracker */}
      <Card>
        <CardContent className="p-6">
          <ProgressTracker steps={workflow.steps} />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Main Panel: Logs and Details */}
        <div className="md:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="logs">Live Logs</TabsTrigger>
              <TabsTrigger value="details">Step Details</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <LiveLogFeed logs={logs} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Current Step: {workflow.currentStepDetails.name}</h3>
                      <p className="text-muted-foreground">
                        {workflow.steps.find((step) => step.id === workflow.currentStepDetails.id)?.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Payload Preview</h4>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                        {JSON.stringify(workflow.currentStepDetails.payload, null, 2)}
                      </pre>
                    </div>

                    {workflow.currentStepDetails.nextRetry && (
                      <div>
                        <h4 className="font-medium mb-2">Next Retry</h4>
                        <p>
                          {new Date(workflow.currentStepDetails.nextRetry).toLocaleTimeString()} (
                          {Math.round((workflow.currentStepDetails.nextRetry.getTime() - new Date().getTime()) / 1000)}{" "}
                          seconds)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: Metrics & Timeline */}
        <div>
          <MetricsSidebar
            startTime={workflow.startTime}
            estimatedTotalTime={workflow.estimatedTotalTime}
            metrics={workflow.metrics}
          />
        </div>
      </div>

      {/* Footer: Status Details & Recommendations */}
      <StatusFooter suggestions={workflow.suggestions} />
    </div>
  )
}
