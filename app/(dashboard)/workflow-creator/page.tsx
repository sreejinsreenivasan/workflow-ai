"use client"

import { FormDescription } from "@/components/ui/form"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { JsonEditor } from "@/components/json-editor"
import Link from "next/link"
import { transformWorkflowToBackendPayload } from "@/lib/workflow-transformer"

// Zod schema for the form
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Workflow name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  stepsJson: z.string().min(10, {
    message: "Steps JSON cannot be empty and must be valid.",
  }),
})

// Sample workflow steps JSON for the editor
const sampleStepsJson = JSON.stringify(
  {
    name: "New Workflow",
    description: "A sample workflow created from the creator page",
    steps: [
      {
        id: "start_node",
        name: "Start Workflow",
        type: "start",
        next: "process_data",
      },
      {
        id: "process_data",
        name: "Process Initial Data",
        type: "function",
        parameters: {
          input: "raw_data",
          transformation: "clean",
        },
        onSuccess: "check_condition",
        onFailure: "handle_failure",
      },
      {
        id: "check_condition",
        name: "Check Data Validity",
        type: "condition",
        condition: "data.isValid === true",
        onTrue: "send_success_email",
        onFalse: "handle_failure",
      },
      {
        id: "send_success_email",
        name: "Send Success Email",
        type: "email",
        to: "admin@example.com",
        subject: "Workflow Completed Successfully",
        body: "The workflow {{workflow.name}} completed successfully.",
        next: "end_node",
      },
      {
        id: "handle_failure",
        name: "Handle Failure",
        type: "function",
        parameters: {
          error: "data.error_message",
          action: "log_and_notify",
        },
        next: "end_node",
      },
      {
        id: "end_node",
        name: "End Workflow",
        type: "end",
      },
    ],
  },
  null,
  2,
)

export default function WorkflowCreatorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      stepsJson: sampleStepsJson,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const parsedSteps = JSON.parse(values.stepsJson)
      const workflowPayload = transformWorkflowToBackendPayload({
        name: values.name,
        description: values.description,
        steps: parsedSteps.steps, // Assuming stepsJson contains a 'steps' array within an object
      })

      const response = await fetch("https://dev-workflow.pixl.ai/api/workflows/definitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create workflow.")
      }

      const result = await response.json()
      toast({
        title: "Workflow Created!",
        description: `Workflow "${result.name}" (ID: ${result.id}) has been successfully created.`,
      })
      router.push(`/workflow/${result.id}`) // Redirect to the new workflow's page
    } catch (error: any) {
      toast({
        title: "Error creating workflow",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
      console.error("Error creating workflow:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Workflow</h1>
          <p className="text-muted-foreground">Define your workflow's name, description, and steps.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
          <CardDescription>Provide basic information and define the workflow steps in JSON.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Customer Onboarding Process" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the workflow's purpose and functionality..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stepsJson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Steps (JSON)</FormLabel>
                    <FormControl>
                      <JsonEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>Define the sequence of steps for your workflow in JSON format.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Workflow
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
