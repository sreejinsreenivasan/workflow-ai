import { z } from "zod"

// Define the workflow schema using Zod
const triggerConfigSchema = z.record(z.any())

const triggerSchema = z.object({
  type: z.enum(["webhook", "schedule", "event"]),
  config: triggerConfigSchema,
})

const parameterSchema = z.record(z.any())

const stepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["start", "function", "condition", "end"]),
  next: z.string().nullable().optional(),
  parameters: parameterSchema.optional(),
  condition: z.string().optional(),
  onTrue: z.string().nullable().optional(),
  onFalse: z.string().nullable().optional(),
})

const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  description: z.string().optional(),
  version: z.string().optional(),
  triggers: z.array(triggerSchema).optional(),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
})

// Type for error locations in the editor
export interface ErrorLocation {
  startLineNumber: number
  startColumn: number
  endLineNumber: number
  endColumn: number
  message: string
}

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  errorLocations: ErrorLocation[]
}

// Function to validate workflow YAML
export function validateWorkflowYaml(yamlObject: any): ValidationResult {
  const result = workflowSchema.safeParse(yamlObject)

  if (result.success) {
    // Additional custom validations
    const errors: string[] = []
    const errorLocations: ErrorLocation[] = []

    // Validate step references
    const workflow = result.data
    const stepIds = new Set(workflow.steps.map((step) => step.id))

    workflow.steps.forEach((step, index) => {
      // Check if 'next' references a valid step
      if (step.next && step.next !== null && !stepIds.has(step.next)) {
        const error = `Step "${step.id}" references non-existent step "${step.next}" in 'next' property`
        errors.push(error)
        errorLocations.push({
          startLineNumber: getStepLineNumber(index),
          startColumn: 1,
          endLineNumber: getStepLineNumber(index) + 1,
          endColumn: 1,
          message: error,
        })
      }

      // Check if 'onTrue' references a valid step
      if (step.onTrue && step.onTrue !== null && !stepIds.has(step.onTrue)) {
        const error = `Step "${step.id}" references non-existent step "${step.onTrue}" in 'onTrue' property`
        errors.push(error)
        errorLocations.push({
          startLineNumber: getStepLineNumber(index),
          startColumn: 1,
          endLineNumber: getStepLineNumber(index) + 1,
          endColumn: 1,
          message: error,
        })
      }

      // Check if 'onFalse' references a valid step
      if (step.onFalse && step.onFalse !== null && !stepIds.has(step.onFalse)) {
        const error = `Step "${step.id}" references non-existent step "${step.onFalse}" in 'onFalse' property`
        errors.push(error)
        errorLocations.push({
          startLineNumber: getStepLineNumber(index),
          startColumn: 1,
          endLineNumber: getStepLineNumber(index) + 1,
          endColumn: 1,
          message: error,
        })
      }

      // Validate condition steps have onTrue and onFalse properties
      if (step.type === "condition") {
        if (!step.condition) {
          const error = `Condition step "${step.id}" is missing required 'condition' property`
          errors.push(error)
          errorLocations.push({
            startLineNumber: getStepLineNumber(index),
            startColumn: 1,
            endLineNumber: getStepLineNumber(index) + 1,
            endColumn: 1,
            message: error,
          })
        }

        if (!step.onTrue) {
          const error = `Condition step "${step.id}" is missing required 'onTrue' property`
          errors.push(error)
          errorLocations.push({
            startLineNumber: getStepLineNumber(index),
            startColumn: 1,
            endLineNumber: getStepLineNumber(index) + 1,
            endColumn: 1,
            message: error,
          })
        }

        if (!step.onFalse) {
          const error = `Condition step "${step.id}" is missing required 'onFalse' property`
          errors.push(error)
          errorLocations.push({
            startLineNumber: getStepLineNumber(index),
            startColumn: 1,
            endLineNumber: getStepLineNumber(index) + 1,
            endColumn: 1,
            message: error,
          })
        }
      }

      // Validate start steps don't have incoming connections
      if (step.type === "start") {
        const hasIncomingConnections = workflow.steps.some(
          (s) => s.next === step.id || s.onTrue === step.id || s.onFalse === step.id,
        )

        if (hasIncomingConnections) {
          const error = `Start step "${step.id}" cannot have incoming connections`
          errors.push(error)
          errorLocations.push({
            startLineNumber: getStepLineNumber(index),
            startColumn: 1,
            endLineNumber: getStepLineNumber(index) + 1,
            endColumn: 1,
            message: error,
          })
        }
      }

      // Validate end steps don't have outgoing connections
      if (step.type === "end" && step.next) {
        const error = `End step "${step.id}" cannot have outgoing connections`
        errors.push(error)
        errorLocations.push({
          startLineNumber: getStepLineNumber(index),
          startColumn: 1,
          endLineNumber: getStepLineNumber(index) + 1,
          endColumn: 1,
          message: error,
        })
      }
    })

    // Check for circular references
    workflow.steps.forEach((step) => {
      if (hasCircularReference(step.id, workflow.steps, new Set())) {
        const error = `Circular reference detected involving step "${step.id}"`
        errors.push(error)
        // We don't have exact line numbers for this error, so we'll just mark the first step in the cycle
        errorLocations.push({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
          message: error,
        })
      }
    })

    // Check for unreachable steps
    const reachableSteps = findReachableSteps(workflow.steps)
    const unreachableStepIds = Array.from(stepIds).filter((id) => !reachableSteps.has(id))

    if (unreachableStepIds.length > 0) {
      unreachableStepIds.forEach((id) => {
        const error = `Step "${id}" is unreachable from any start step`
        errors.push(error)

        // Find the index of the unreachable step
        const stepIndex = workflow.steps.findIndex((s) => s.id === id)
        if (stepIndex >= 0) {
          errorLocations.push({
            startLineNumber: getStepLineNumber(stepIndex),
            startColumn: 1,
            endLineNumber: getStepLineNumber(stepIndex) + 1,
            endColumn: 1,
            message: error,
          })
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      errorLocations,
    }
  } else {
    // Handle Zod validation errors
    const errors = result.error.errors.map((err) => {
      const path = err.path.join(".")
      return `${path ? path + ": " : ""}${err.message}`
    })

    // Create error locations (this is an approximation since we don't have line numbers from Zod)
    const errorLocations: ErrorLocation[] = result.error.errors.map((err) => ({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
      message: `${err.path.join(".")}: ${err.message}`,
    }))

    return {
      isValid: false,
      errors,
      errorLocations,
    }
  }
}

// Helper function to estimate line numbers for steps
// In a real implementation, you would need to parse the YAML and get actual line numbers
function getStepLineNumber(stepIndex: number): number {
  // This is a very rough approximation
  // In a real implementation, you would need to parse the YAML and get actual line numbers
  return stepIndex * 10 + 10
}

// Helper function to check for circular references
function hasCircularReference(stepId: string, steps: z.infer<typeof stepSchema>[], visited: Set<string>): boolean {
  if (visited.has(stepId)) {
    return true
  }

  visited.add(stepId)

  const step = steps.find((s) => s.id === stepId)
  if (!step) {
    return false
  }

  if (step.next && step.next !== null) {
    if (hasCircularReference(step.next, steps, new Set(visited))) {
      return true
    }
  }

  if (step.onTrue && step.onTrue !== null) {
    if (hasCircularReference(step.onTrue, steps, new Set(visited))) {
      return true
    }
  }

  if (step.onFalse && step.onFalse !== null) {
    if (hasCircularReference(step.onFalse, steps, new Set(visited))) {
      return true
    }
  }

  return false
}

// Helper function to find all reachable steps from start steps
function findReachableSteps(steps: z.infer<typeof stepSchema>[]): Set<string> {
  const reachable = new Set<string>()
  const startSteps = steps.filter((step) => step.type === "start")

  function traverse(stepId: string) {
    if (reachable.has(stepId)) {
      return
    }

    reachable.add(stepId)

    const step = steps.find((s) => s.id === stepId)
    if (!step) {
      return
    }

    if (step.next && step.next !== null) {
      traverse(step.next)
    }

    if (step.onTrue && step.onTrue !== null) {
      traverse(step.onTrue)
    }

    if (step.onFalse && step.onFalse !== null) {
      traverse(step.onFalse)
    }
  }

  startSteps.forEach((step) => traverse(step.id))

  return reachable
}
