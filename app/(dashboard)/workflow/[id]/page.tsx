"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonEditor } from "@/components/json-editor"
import { FeedbackForm } from "@/components/feedback-form"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Play, Clock, BarChart, CheckCircle, XCircle, Edit, Code, Activity } from "lucide-react"
import Link from "next/link"

// Mock workflow data
const mockWorkflow = {
  id: "1",
  name: "Customer Onboarding",
  description: "Process for onboarding new customers into the system",
  status: "active",
  lastRun: "2 hours ago",
  runCount: 45,
  tags: ["customer", "onboarding", "automation"],
  definition: {
    name: "Customer Onboarding",
    description: "Process for onboarding new customers into the system",
    steps: [
      {
        id: "step1",
        name: "Initialize",
        type: "start",
        next: "step2",
      },
      {
        id: "step2",
        name: "Process Data",
        type: "function",
        parameters: {
          input: "data",
          transformation: "normalize",
        },
        next: "step3",
      },
      {
        id: "step3",
        name: "Make Decision",
        type: "condition",
        condition: "data.valid === true",
        onTrue: "step4",
        onFalse: "step5",
      },
      {
        id: "step4",
        name: "Success Path",
        type: "function",
        parameters: {
          action: "complete",
        },
        next: null,
      },
      {
        id: "step5",
        name: "Error Path",
        type: "function",
        parameters: {
          action: "retry",
        },
        next: "step2",
      },
    ],
  },
}

export default function WorkflowPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [workflow, setWorkflow] = useState(mockWorkflow)
  const [definition, setDefinition] = useState(JSON.stringify(mockWorkflow.definition, null, 2))
  const [isRunning, setIsRunning] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Simulate fetching workflow data
  useEffect(() => {
    // In a real app, you would fetch the workflow data from your API
    // For now, we'll just use the mock data
  }, [params.id])

  const handleRunWorkflow = () => {
    setIsRunning(true)

    // Simulate workflow execution
    toast({
      title: "Workflow started",
      description: "The workflow is now running...",
    })

    // Navigate to progress page
    router.push(`/workflow/${params.id}/progress`)
  }

  const handleSaveDefinition = () => {
    try {
      const parsedDefinition = JSON.parse(definition)
      setWorkflow({
        ...workflow,
        definition: parsedDefinition,
      })

      toast({
        title: "Workflow saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/library">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Library</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{workflow.name}</h1>
          <p className="text-muted-foreground">{workflow.description}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-medium capitalize">{workflow.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{workflow.lastRun}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span>{workflow.runCount} runs</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {workflow.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/workflow-canvas?id=${params.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit in Canvas
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/yaml-editor?id=${params.id}`}>
            <Code className="mr-2 h-4 w-4" />
            Edit as YAML
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/workflow/${params.id}/progress`}>
            <Activity className="mr-2 h-4 w-4" />
            View Progress
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="definition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="definition">Definition</TabsTrigger>
          <TabsTrigger value="runs">Run History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="definition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Definition</CardTitle>
              <CardDescription>Edit the JSON definition of your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <JsonEditor value={definition} onChange={setDefinition} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setDefinition(JSON.stringify(workflow.definition, null, 2))}>
                Reset
              </Button>
              <Button onClick={handleSaveDefinition}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
              <CardDescription>History of recent workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">Successful Run</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/workflow/${params.id}/progress`}>View Details</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">Successful Run</p>
                        <p className="text-sm text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="font-medium">Failed Run</p>
                        <p className="text-sm text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>Configure settings for this workflow</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Settings content would go here */}
              <p className="text-muted-foreground">Settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleRunWorkflow} disabled={isRunning}>
          {isRunning ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Workflow
            </>
          )}
        </Button>
      </div>

      <FeedbackForm
        workflowId={workflow.id}
        workflowName={workflow.name}
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  )
}
