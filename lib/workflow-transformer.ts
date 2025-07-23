// Define simplified interfaces for backend schema based on the Python BaseModel
interface BackendApiConfig {
  url: string
  method: string
  timeout?: number
  headers?: Array<{ key: string; value: string }>
  body?: string
  contentType?: string
  authType?: string
  token?: string
  username?: string
  password?: string
  apiKeyName?: string
  apiKeyValue?: string
}

interface BackendFormField {
  name: string
  type: string
  label?: string
  placeholder?: string
  required?: boolean
}

interface BackendForm {
  title?: string
  description?: string
  fields?: BackendFormField[]
}

interface BackendStep {
  id: string
  name?: string
  description?: string
  type: "TASK" | "CONDITION" | "START" | "END" // Assuming these are the StepType enum values
  action_type: string // This will be like "HTTP_REQUEST", "AI_PROCESS", "USER_FORM_INPUT", etc.
  input_fields?: any[] // Generic for now, as StepInput is not detailed
  form?: BackendForm
  api_config?: BackendApiConfig
  ui?: any // Generic
  system_arguments?: any[] // Generic
  on_success?: string | null
  on_failure?: string | null
  next?: string | null
}

export interface CreateWorkflowRequestPayload {
  name: string
  description?: string
  steps: BackendStep[]
}

// Utility function to transform internal workflow representation to backend payload
export function transformWorkflowToBackendPayload(workflow: any): CreateWorkflowRequestPayload {
  const backendSteps: BackendStep[] = workflow.steps.map((step: any) => {
    const backendStep: BackendStep = {
      id: step.id,
      name: step.name,
      description: step.description,
      input_fields: [], // Default empty
    }

    // Determine backend 'type' and 'action_type'
    switch (step.type) {
      case "start":
        backendStep.type = "START"
        backendStep.action_type = "START_WORKFLOW"
        backendStep.next = step.next
        break
      case "end":
        backendStep.type = "END"
        backendStep.action_type = "END_WORKFLOW"
        break
      case "condition":
        backendStep.type = "CONDITION"
        backendStep.action_type = "EVALUATE_CONDITION"
        // For condition nodes, onTrue maps to on_success, onFalse maps to on_failure
        backendStep.on_success = step.onTrue
        backendStep.on_failure = step.onFalse
        // The condition expression itself might go into input_fields or a specific field if backend supports it.
        backendStep.input_fields = [{ name: "condition_expression", value: step.condition }]
        break
      default: // All other types map to TASK
        backendStep.type = "TASK"
        backendStep.next = step.next
        backendStep.on_success = step.onSuccess
        backendStep.on_failure = step.onFailure

        // Map specific action types and their configurations
        switch (step.type) {
          case "function":
            backendStep.action_type = "GENERIC_FUNCTION"
            if (step.parameters) {
              backendStep.input_fields = [{ name: "parameters", value: step.parameters }]
            }
            break
          case "http_request": // New case for HTTP_REQUEST
            backendStep.action_type = "HTTP_REQUEST"
            backendStep.api_config = {
              url: step.url,
              method: step.method,
              timeout: step.timeout,
              headers: step.headers,
              body: step.body,
              contentType: step.contentType,
              authType: step.authType,
              token: step.token,
              username: step.username,
              password: step.password,
              apiKeyName: step.apiKeyName,
              apiKeyValue: step.apiKeyValue,
            }
            break
          case "ai_copilot":
            backendStep.action_type = "AI_PROCESS"
            backendStep.input_fields = [
              { name: "aiModel", value: step.aiModel },
              { name: "systemPrompt", value: step.systemPrompt },
              { name: "userPrompt", value: step.userPrompt },
              { name: "temperature", value: step.temperature },
              { name: "maxTokens", value: step.maxTokens },
            ]
            break
          case "form": // This maps to the backend's generic "TASK" with "USER_FORM_INPUT" action_type
            backendStep.action_type = "USER_FORM_INPUT"
            backendStep.form = {
              title: step.formTitle,
              description: step.formDescription,
              fields: step.fields?.map((f: any) => ({
                name: f.name,
                type: f.type,
                label: f.label,
                placeholder: f.placeholder,
                required: f.required,
              })),
            }
            break
          case "timer":
            backendStep.action_type = "WAIT_TIMER"
            backendStep.input_fields = [
              { name: "durationType", value: step.durationType },
              { name: "duration", value: step.duration },
              { name: "unit", value: step.unit },
              { name: "variableName", value: step.variableName },
              { name: "targetTime", value: step.targetTime },
              { name: "allowCancel", value: step.allowCancel },
            ]
            break
          case "email":
            backendStep.action_type = "SEND_EMAIL"
            backendStep.input_fields = [
              { name: "to", value: step.to },
              { name: "subject", value: step.subject },
              { name: "body", value: step.body },
            ]
            break
          case "webhook":
            backendStep.action_type = "SEND_WEBHOOK"
            backendStep.input_fields = [
              { name: "url", value: step.url },
              { name: "method", value: step.method },
              { name: "payload", value: step.payload },
            ]
            break
          case "database":
            backendStep.action_type = "DATABASE_OPERATION"
            backendStep.input_fields = [
              { name: "operation", value: step.operation },
              { name: "table", value: step.table },
              { name: "query", value: step.query },
              { name: "data", value: step.data },
            ]
            break
          case "file_upload":
            backendStep.action_type = "FILE_UPLOAD_OPERATION"
            backendStep.input_fields = [
              { name: "storagePath", value: step.storagePath },
              { name: "allowedTypes", value: step.allowedTypes },
              { name: "maxSize", value: step.maxSize },
            ]
            break
          case "custom_subgraph":
            backendStep.action_type = "EXECUTE_SUBGRAPH"
            backendStep.input_fields = [
              { name: "subgraphId", value: step.subgraphId },
              { name: "inputs", value: step.inputs },
            ]
            break
        }
        break
    }
    return backendStep
  })

  return {
    name: workflow.name,
    description: workflow.description,
    steps: backendSteps,
  }
}
