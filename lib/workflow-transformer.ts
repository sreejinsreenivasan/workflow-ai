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
  retry_policy?: BackendRetryPolicy
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
  timeout_seconds?: number
  max_retries?: number
  retry_count?: number
  context_mappings?: Array<{ from: string; to: string }>
  position?: { x: number; y: number }
}

export interface CreateWorkflowRequestPayload {
  name: string
  description?: string
  steps: BackendStep[]
}

interface BackendWorkflow {
  name: string
  description: string
  nodes: { [key: string]: BackendNode }
  edges: BackendEdge[]
}

interface BackendNode {
  id: string
  name?: string
  description?: string
  type: NodeType
  config: any
  timeout_seconds?: number
  max_retries?: number
  retry_count?: number
  context_mappings?: Array<{ from: string; to: string }>
  position?: { x: number; y: number }
}

interface BackendEdge {
  from_node: string
  to_node: string
  condition: EdgeCondition
  priority: number
}

enum NodeType {
  START = "START",
  END = "END",
  CONDITION = "CONDITION",
  TASK = "TASK",
  HTTP_REQUEST = "HTTP_REQUEST",
}

enum EdgeCondition {
  DEFAULT = "DEFAULT",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  TRUE = "TRUE",
  FALSE = "FALSE",
}

export interface BackendRetryPolicy {
  enabled: boolean
  max_attempts: number
}

// Utility function to transform internal workflow representation to backend payload
export function transformWorkflowToBackendPayload(
  nodes: any[],
  edges: any[],
  workflowName = "Canvas Workflow",
  workflowDescription = "Workflow created using the visual canvas editor",
): BackendWorkflow {
  const backendNodes: { [key: string]: BackendNode } = {}
  const backendEdges: any[] = []

  // Map React Flow Nodes to Backend Nodes
  nodes.forEach((node: any) => {
    let nodeType: NodeType
    let config: any = {} // Use 'any' for now to allow flexible config structure

    // Default values for backend node properties
    const timeout_seconds = node.data.timeout || 300
    const max_retries = 3
    const retry_count = 0
    const context_mappings: Array<{ from: string; to: string }> = [] // Placeholder for now

    switch (node.type) {
      case "start":
        nodeType = NodeType.START
        config = {
          ui: {
            context_schema: {}, // Placeholder
          },
        }
        break
      case "end":
        nodeType = NodeType.END
        config = {}
        break
      case "condition":
        nodeType = NodeType.CONDITION
        config = {
          condition_expression: node.data.condition || "true",
        }
        break
      case "function":
        nodeType = NodeType.TASK // Generic function maps to TASK
        config = {
          parameters: node.data.parameters || {},
        }
        break
      case "http_request":
        nodeType = NodeType.HTTP_REQUEST
        const httpConfig: BackendApiConfig = {
          url: node.data.url || "",
          method: node.data.method || "GET",
          timeout: node.data.timeout,
          headers: node.data.headers || [],
          body: node.data.body || "",
          contentType: node.data.contentType || "application/json",
          authType: node.data.authType || "none",
          token: node.data.token,
          username: node.data.username,
          password: node.data.password,
          apiKeyName: node.data.apiKeyName,
          apiKeyValue: node.data.apiKeyValue,
          retry_policy: { enabled: true, max_attempts: 2 }, // Default retry policy
        }
        config = httpConfig
        break
      case "interactive_form_http":
        nodeType = NodeType.TASK // Interactive form maps to TASK
        config = {
          ui: {
            form: {
              name: node.data.label || "Form",
              fields: (node.data.formFields || []).map((f: any) => ({
                name: f.name,
                type: f.type,
                label: f.label,
                placeholder: f.placeholder,
                required: f.required,
              })),
            },
          },
          url: node.data.httpUrl || "",
          method: node.data.httpMethod || "POST",
          body: node.data.httpBodyTemplate || "",
          // Add other HTTP related fields if they are part of the backend's interactive form config
          retry_policy: { enabled: true, max_attempts: 2 }, // Default retry policy
        }
        break
      case "ai_copilot":
        nodeType = NodeType.TASK
        config = {
          aiModel: node.data.aiModel,
          systemPrompt: node.data.systemPrompt,
          userPrompt: node.data.userPrompt,
          temperature: node.data.temperature,
          maxTokens: node.data.maxTokens,
        }
        break
      case "timer":
        nodeType = NodeType.TASK
        config = {
          durationType: node.data.durationType,
          duration: node.data.duration,
          unit: node.data.unit,
          variableName: node.data.variableName,
          targetTime: node.data.targetTime,
          allowCancel: node.data.allowCancel,
        }
        break
      case "email":
        nodeType = NodeType.TASK
        config = {
          to: node.data.to,
          subject: node.data.subject,
          body: node.data.body,
        }
        break
      case "webhook":
        nodeType = NodeType.TASK
        config = {
          url: node.data.url,
          method: node.data.method,
          payload: node.data.payload,
        }
        break
      case "database":
        nodeType = NodeType.TASK
        config = {
          operation: node.data.operation,
          table: node.data.table,
          query: node.data.query,
          data: node.data.data,
        }
        break
      case "file_upload":
        nodeType = NodeType.TASK
        config = {
          storagePath: node.data.storagePath,
          allowedTypes: node.data.allowedTypes,
          maxSize: node.data.maxSize,
        }
        break
      case "custom_subgraph":
        nodeType = NodeType.TASK
        config = {
          subgraphId: node.data.subgraphId,
          inputs: node.data.inputs,
        }
        break
      default:
        nodeType = NodeType.TASK // Default to TASK for unknown types
        config = {}
        break
    }

    backendNodes[node.id] = {
      id: node.id,
      name: node.data.label || `Node ${node.id}`,
      description: node.data.description || null,
      type: nodeType,
      config: config,
      timeout_seconds: timeout_seconds,
      max_retries: max_retries,
      retry_count: retry_count,
      context_mappings: context_mappings,
      position: node.position, // Store React Flow position
    }
  })

  // Map React Flow Edges to Backend Edges
  edges.forEach((edge: any) => {
    let condition: EdgeCondition = EdgeCondition.DEFAULT
    switch (edge.data?.edgeType) {
      case "on_success":
        condition = EdgeCondition.SUCCESS
        break
      case "on_failure":
        condition = EdgeCondition.FAILURE
        break
      case "on_true":
        condition = EdgeCondition.TRUE
        break
      case "on_false":
        condition = EdgeCondition.FALSE
        break
      default:
        condition = EdgeCondition.DEFAULT
        break
    }

    backendEdges.push({
      from_node: edge.source,
      to_node: edge.target,
      condition: condition,
      priority: 0, // Default priority
    })
  })

  return {
    name: workflowName,
    description: workflowDescription,
    nodes: backendNodes,
    edges: backendEdges,
  }
}
