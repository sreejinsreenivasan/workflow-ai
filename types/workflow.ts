// Enums mirroring Python Backend
export enum NodeType {
  TASK = "TASK",
  CONDITION = "CONDITION",
  START = "START",
  END = "END",
  HTTP_REQUEST = "HTTP_REQUEST",
  // Add other node types as they are defined in your backend
}

export enum EdgeCondition {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  TRUE = "TRUE",
  FALSE = "FALSE",
  DEFAULT = "DEFAULT", // For general connections
}

// Backend Configuration Interfaces
export interface BackendFormField {
  name: string
  type: string
  label?: string
  placeholder?: string
  required?: boolean
}

export interface BackendFormConfig {
  name?: string
  fields?: BackendFormField[]
}

export interface BackendUIConfig {
  form?: BackendFormConfig
  context_schema?: Record<string, any> // Generic for now, can be more specific
}

export interface BackendRetryPolicy {
  enabled: boolean
  max_attempts?: number
  delay_seconds?: number
  backoff_factor?: number
}

export interface BackendApiConfig {
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

export interface BackendNodeConfig {
  ui?: BackendUIConfig
  parameters?: Record<string, any> // For function nodes
  condition_expression?: string // For condition nodes
  // HTTP Request specific
  url?: string
  method?: string
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
  // Add other specific configs as needed for other node types
}

// Backend Node Interface
export interface BackendNode {
  id: string
  name: string
  description?: string | null
  type: NodeType
  config: BackendNodeConfig
  timeout_seconds: number
  max_retries: number
  retry_count: number
  context_mappings: Array<{ from: string; to: string }> // Simplified for now
  position: { x: number; y: number } // Storing React Flow position for round-trip
}

// Backend Edge Interface
export interface BackendEdge {
  from_node: string
  to_node: string
  condition: EdgeCondition
  priority: number
}

// Backend Workflow Interface
export interface BackendWorkflow {
  id?: string // UUID from backend
  name: string
  description?: string
  nodes: { [key: string]: BackendNode } // Dictionary of nodes
  edges: BackendEdge[]
}

export interface WorkflowNodeOutputField {
  key: string
  label: string
  type: string // e.g., 'string', 'number', 'boolean', 'object', 'array'
  description?: string
  children?: WorkflowNodeOutputField[] // For nested objects/arrays
}

export interface WorkflowNodeOutput {
  [key: string]: WorkflowNodeOutputField
}

export interface PreviousWorkflowNode {
  id: string
  label: string
  type: string // Corresponds to backend node types like 'START', 'TASK', 'HTTP_REQUEST'
  outputs: WorkflowNodeOutput
}

export interface CurrentNodeInputField {
  name: string // Corresponds to the key in the node's data/parameters
  label: string
  type: string // e.g., 'string', 'number', 'boolean', 'object', 'array'
  description?: string
  required?: boolean
}

// NodeData represents the `data` property of a ReactFlow Node
// This is the frontend's internal representation of node configuration
export interface NodeData {
  label: string
  description?: string
  // Common properties
  parameters?: any
  condition?: string
  // HTTP Request specific
  method?: string
  url?: string
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
  // Form specific (for interactive_form_http)
  formFields?: BackendFormField[] // Using BackendFormField for consistency
  httpMethod?: string
  httpUrl?: string
  httpBodyTemplate?: string
  errorMapping?: Record<string, string>
  // AI Copilot specific
  aiModel?: string
  systemPrompt?: string
  userPrompt?: string
  temperature?: number
  maxTokens?: number
  // Timer specific
  durationType?: "duration" | "targetTime"
  duration?: number
  unit?: "seconds" | "minutes" | "hours" | "days"
  variableName?: string
  targetTime?: string // ISO string or expression
  allowCancel?: boolean
  // Email specific
  to?: string
  subject?: string
  emailBody?: string
  // Webhook specific
  payload?: string
  // Database specific
  operation?: string
  table?: string
  query?: string
  data?: any
  // File Upload specific
  storagePath?: string
  allowedTypes?: string[]
  maxSize?: number
  // Custom Subgraph specific
  subgraphId?: string
  inputs?: any
}

// Extend ReactFlow Node to include our NodeData
declare module "reactflow" {
  export interface Node<T = NodeData> {
    data: T
  }
}
