import type { BackendWorkflow } from "@/types/workflow"

// API Configuration
const API_BASE_URL = "https://dev-workflow.pixl.ai/api/workflows/definitions"

// API Response Types
export interface WorkflowApiResponse {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  nodes: Record<string, any>
  edges: any[]
}

export interface WorkflowListResponse {
  workflows: WorkflowApiResponse[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  message: string
  status: number
  details?: any
}

// Custom error class for API errors
export class WorkflowApiError extends Error {
  status: number
  details?: any

  constructor(message: string, status: number, details?: any) {
    super(message)
    this.name = "WorkflowApiError"
    this.status = status
    this.details = details
  }
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorDetails: any = null

    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.message || errorMessage
      errorDetails = errorData
    } catch {
      // If we can't parse the error response, use the default message
    }

    throw new WorkflowApiError(errorMessage, response.status, errorDetails)
  }

  try {
    return await response.json()
  } catch (error) {
    throw new WorkflowApiError("Failed to parse response JSON", 500, error)
  }
}

// Helper function to create request headers
function createHeaders(additionalHeaders?: Record<string, string>): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...additionalHeaders,
  }
}

// CRUD Operations

/**
 * Create a new workflow
 */
export async function createWorkflow(workflow: BackendWorkflow): Promise<WorkflowApiResponse> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify(workflow),
    })

    return await handleApiResponse<WorkflowApiResponse>(response)
  } catch (error) {
    if (error instanceof WorkflowApiError) {
      throw error
    }
    throw new WorkflowApiError(
      `Failed to create workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    )
  }
}

/**
 * Get a workflow by ID
 */
export async function getWorkflow(id: string): Promise<WorkflowApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: createHeaders(),
    })

    return await handleApiResponse<WorkflowApiResponse>(response)
  } catch (error) {
    if (error instanceof WorkflowApiError) {
      throw error
    }
    throw new WorkflowApiError(
      `Failed to fetch workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    )
  }
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(id: string, workflow: BackendWorkflow): Promise<WorkflowApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify(workflow),
    })

    return await handleApiResponse<WorkflowApiResponse>(response)
  } catch (error) {
    if (error instanceof WorkflowApiError) {
      throw error
    }
    throw new WorkflowApiError(
      `Failed to update workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    )
  }
}

/**
 * Delete a workflow by ID
 */
export async function deleteWorkflow(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // If we can't parse the error response, use the default message
      }
      throw new WorkflowApiError(errorMessage, response.status)
    }
  } catch (error) {
    if (error instanceof WorkflowApiError) {
      throw error
    }
    throw new WorkflowApiError(
      `Failed to delete workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    )
  }
}

/**
 * List workflows with optional pagination and search
 */
export async function listWorkflows(options?: {
  page?: number
  limit?: number
  search?: string
}): Promise<WorkflowListResponse> {
  try {
    const params = new URLSearchParams()
    if (options?.page) params.append("page", options.page.toString())
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.search) params.append("search", options.search)

    const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL

    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
    })

    return await handleApiResponse<WorkflowListResponse>(response)
  } catch (error) {
    if (error instanceof WorkflowApiError) {
      throw error
    }
    throw new WorkflowApiError(
      `Failed to list workflows: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    )
  }
}

/**
 * Check if the API is available (health check)
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: createHeaders(),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx) except for 408, 429
      if (error instanceof WorkflowApiError) {
        const shouldRetry = 
          error.status === 0 || // Network error
          error.status >= 500 || // Server error
          error.status === 408 || // Request timeout
          error.status === 429    // Too many requests

        if (!shouldRetry || attempt === maxRetries) {
          throw error
        }
      } else if (attempt === maxRetries) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Utility functions for transforming API responses to frontend format

/**
 * Transform API response to ReactFlow nodes and edges
 */
export function transformApiResponseToCanvas(apiResponse: WorkflowApiResponse): {
  nodes: any[]
  edges: any[]
} {
  const nodes: any[] = []
  const edges: any[] = []

  // Transform nodes
  Object.entries(apiResponse.nodes).forEach(([nodeId, nodeData]: [string, any]) => {
    nodes.push({
      id: nodeId,
      type: getReactFlowNodeType(nodeData.type),
      position: nodeData.position || { x: 0, y: 0 },
      data: transformBackendNodeToFrontend(nodeData),
    })
  })

  // Transform edges
  apiResponse.edges.forEach((edge: any) => {
    edges.push({
      id: `${edge.from_node}-${edge.to_node}`,
      source: edge.from_node,
      target: edge.to_node,
      type: "default",
      animated: true,
      data: {
        edgeType: getEdgeTypeFromCondition(edge.condition),
      },
    })
  })

  return { nodes, edges }
}

/**
 * Map backend node types to ReactFlow node types
 */
function getReactFlowNodeType(backendType: string): string {
  const typeMap: Record<string, string> = {
    START: "start",
    END: "end",
    TASK: "function",
    CONDITION: "condition",
    HTTP_REQUEST: "http_request",
  }
  return typeMap[backendType] || "function"
}

/**
 * Map backend edge conditions to frontend edge types
 */
function getEdgeTypeFromCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    SUCCESS: "on_success",
    FAILURE: "on_failure",
    TRUE: "on_true",
    FALSE: "on_false",
    DEFAULT: "default",
  }
  return conditionMap[condition] || "default"
}

/**
 * Transform backend node data to frontend format
 */
function transformBackendNodeToFrontend(backendNode: any): any {
  const frontendData: any = {
    label: backendNode.name || backendNode.id,
    description: backendNode.description,
  }

  // Transform config based on node type
  if (backendNode.config) {
    switch (backendNode.type) {
      case "HTTP_REQUEST":
        frontendData.method = backendNode.config.method
        frontendData.url = backendNode.config.url
        frontendData.timeout = backendNode.config.timeout
        frontendData.headers = backendNode.config.headers
        frontendData.body = backendNode.config.body
        frontendData.contentType = backendNode.config.contentType
        frontendData.authType = backendNode.config.authType
        frontendData.token = backendNode.config.token
        frontendData.username = backendNode.config.username
        frontendData.password = backendNode.config.password
        frontendData.apiKeyName = backendNode.config.apiKeyName
        frontendData.apiKeyValue = backendNode.config.apiKeyValue
        break
      case "CONDITION":
        frontendData.condition = backendNode.config.condition_expression
        break
      case "TASK":
        frontendData.parameters = backendNode.config.parameters
        break
    }
  }

  return frontendData
}
