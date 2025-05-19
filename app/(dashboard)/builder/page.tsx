"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { HelpCircle, Loader2 } from "lucide-react"
import { JsonEditor } from "@/components/json-editor"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Workflow name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

export default function BuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      const mockWorkflow = {
        name: values.name,
        description: values.description,
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
      }

      setGeneratedWorkflow(JSON.stringify(mockWorkflow, null, 2))
      setIsGenerating(false)

      toast({
        title: "Workflow Generated",
        description: "Your workflow has been generated successfully.",
      })
    }, 2000)
  }

  const handleSave = () => {
    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved to the library.",
    })
    router.push("/library")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Workflow Builder</h1>
        <p className="text-muted-foreground">Describe your workflow and let AI generate it for you</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Workflow</CardTitle>
          <CardDescription>Provide a name and detailed description of the workflow you want to create</CardDescription>
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
                    <FormDescription>A clear, concise name for your workflow</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Description</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" type="button">
                              <HelpCircle className="h-4 w-4" />
                              <span className="sr-only">Description tips</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Tips for a good description:</p>
                            <ul className="ml-4 mt-2 list-disc">
                              <li>Include the goal of the workflow</li>
                              <li>Mention key steps or decision points</li>
                              <li>Specify any inputs or outputs</li>
                              <li>Note any special conditions or requirements</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the workflow in detail, including its purpose, steps, and any specific requirements..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Workflow"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Workflow</CardTitle>
            <CardDescription>Review and edit the generated workflow definition</CardDescription>
          </CardHeader>
          <CardContent>
            <JsonEditor value={generatedWorkflow} onChange={setGeneratedWorkflow} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setGeneratedWorkflow(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Workflow</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
