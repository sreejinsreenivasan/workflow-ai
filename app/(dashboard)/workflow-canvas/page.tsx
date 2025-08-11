"use client"

import type React from "react"

import { useCallback, useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  Panel,
  ReactFlowProvider,
  type Node,
  useReactFlow,
  ConnectionLineType,
} from "reactflow"
import "reactflow/dist/style.css"
import { stringify } from "yaml"
import { Button } from "@/components/ui/button"
import { StartNode } from "@/components/flow-nodes/start-node"
import { FunctionNode } from "@/components/flow-nodes/function-node"
import { ConditionNode } from "@/components/flow-nodes/condition-node"
import { EndNode } from "@/components/flow-nodes/end-node"
import { InteractiveFormHttpNode } from "@/components/flow-nodes/interactive-form-http-node"
import { HttpRequestNode } from "@/components/flow-nodes/http-request-node"
import { NodePalette } from "@/components/node-palette"
import { NodeConfigPanel } from "@/components/node-config-panel"
import { transformWorkflowToBackendPayload } from "@/lib/workflow-transformer"
import { getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow, transformApiResponseToCanvas, WorkflowApiError, withRetry, checkApiHealth } from "@/lib/workflow-api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Download, ZoomIn, Undo, Redo, MoreHorizontal, Eye, Save, AlertCircle, Trash2, WifiOff, RefreshCw, Edit2, Check, X } from "lucide-react"
import Link from "next/link"
import { CanvasContextMenu } from "@/components/canvas-context-menu"
import { CollaborationIndicator } from "@/components/collaboration-indicator"
import { YamlPreview } from "@/components/yaml-preview"
import { ConditionalEdgeDialog } from "@/components/conditional-edge-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { BackendWorkflow } from "@/types/workflow"

const nodeTypes = {
  start: StartNode,
  function: FunctionNode,
  condition: ConditionNode,
  end: EndNode,
  interactive_form_http: InteractiveFormHttpNode,
  http_request: HttpRequestNode,
}

const initialNodes: Node[] = [
  {
    id: "start-node-1",
    type: "start",
    position: { x: 250, y: 50 },
    data: { label: "Workflow Start", description: "Entry point of the workflow." },
  },
  {
    id: "task-node-1",
    type: "function",
    position: { x: 250, y: 200 },
    data: { label: "Process Data", parameters: { input: "initial_data" } },
  },
  {
    id: "http-request-node-1",
    type: "http_request",
    position: { x: 500, y: 200 },
    data: {
      label: "Fetch User Data",
      method: "GET",
      url: "https://api.example.com/users/{{get('task-node-1.output.userId')}}",
      headers: [{ key: "Authorization", value: "Bearer token" }],
      body: "",
      authType: "bearer",
      token: "your_token_here",
      timeout: 60,
    },
  },
  {
    id: "condition-node-1",
    type: "condition",
    position: { x: 250, y: 350 },
    data: {
      label: "Check Status",
      condition: "data.status === 'approved'",
      description: "Checks if the status is approved.",
    },
  },
  {
    id: "form-node-1",
    type: "interactive_form_http",
    position: { x: 500, y: 400 },
    data: {
      label: "User Feedback Form",
      formFields: [
        { name: "feedback", label: "Your Feedback", type: "textarea", placeholder: "Enter feedback" },
        { name: "rating", label: "Rating", type: "number", placeholder: "1-5" },
      ],
      httpMethod: "POST",
      httpUrl: "https://api.example.com/feedback",
      httpBodyTemplate: '{"feedback": "{{feedback}}", "rating": {{rating}}}',
      errorMapping: { api_error_message: "feedback" },
    },
  },
  {
    id: "end-node-1",
    type: "end",
    position: { x: 250, y: 500 },
    data: { label: "Workflow End", description: "End point of the workflow." },
  },
]

const initialEdges = [
  { id: "e1-2", source: "start-node-1", target: "task-node-1", animated: true },
  { id: "e2-3", source: "task-node-1", target: "condition-node-1", animated: true },
  {
    id: "e3-4-true",
    source: "condition-node-1",
    target: "http-request-node-1",
    animated: true,
    label: "True",
    data: { edgeType: "on_true" },
    style: { stroke: "#22c55e", strokeWidth: 2 },
    labelStyle: { fill: "#22c55e", fontWeight: 600 },
  },
  {
    id: "e3-5-false",
    source: "condition-node-1",
    target: "form-node-1",
    animated: true,
    label: "False",
    data: { edgeType: "on_false" },
    style: { stroke: "#ef4444", strokeWidth: 2 },
    labelStyle: { fill: "#ef4444", fontWeight: 600 },
  },
  { id: "e4-6", source: "http-request-node-1", target: "end-node-1", animated: true },
  { id: "e5-6", source: "form-node-1", target: "end-node-1", animated: true },
]

function WorkflowCanvasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Wrap node and edge change handlers to track unsaved changes
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes)
    setHasUnsavedChanges(true)
  }, [onNodesChange])

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes)
    setHasUnsavedChanges(true)
  }, [onEdgesChange])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [pendingConnection, setPendingConnection] = useState<{
    source: string
    target: string
    sourceNode: Node | null
    targetNode: Node | null
  } | null>(null)
  const [showEdgeDialog, setShowEdgeDialog] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const [isPaletteOpen, setIsPaletteOpen] = useState(true)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [showYamlPreview, setShowYamlPreview] = useState(false)
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [apiHealthy, setApiHealthy] = useState(true)
  const [lastSaveAttempt, setLastSaveAttempt] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [workflowMetadata, setWorkflowMetadata] = useState<{
    name: string
    description: string
  }>({
    name: "New Workflow",
    description: "Workflow created using the visual canvas editor"
  })
  const { project, fitView, getNodes, getEdges } = useReactFlow()

  // Get workflow ID from query params
  const workflowId = searchParams.get("id")

  // Offline detection and API health monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Check API health when coming back online
      checkApiHealth().then(setApiHealthy)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setApiHealthy(false)
    }

    // Initial online status
    setIsOnline(navigator.onLine)
    
    // Check API health on mount
    checkApiHealth().then(setApiHealthy)

    // Set up event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic API health check (every 30 seconds)
    const healthCheckInterval = setInterval(async () => {
      if (navigator.onLine) {
        const healthy = await checkApiHealth()
        setApiHealthy(healthy)
      }
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(healthCheckInterval)
    }
  }, [])

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isOnline) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes and are currently offline. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, isOnline])

  // Load workflow data when component mounts or workflowId changes
  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) {
        // No workflow ID, load default nodes and edges
        setNodes(initialNodes)
        setEdges(initialEdges)
        setWorkflowMetadata({
          name: "New Workflow",
          description: "Workflow created using the visual canvas editor"
        })
        return
      }

      setIsLoading(true)
      setLoadError(null)

      try {
        // Check if we're online before attempting to load
        if (!isOnline) {
          throw new Error("Cannot load workflow while offline. Please check your internet connection.")
        }

        // Use retry logic for loading workflow
        const workflowData = await withRetry(
          () => getWorkflow(workflowId),
          3, // max retries
          1000 // base delay
        )
        
        const { nodes: loadedNodes, edges: loadedEdges } = transformApiResponseToCanvas(workflowData)
        
        setNodes(loadedNodes)
        setEdges(loadedEdges)
        setWorkflowMetadata({
          name: workflowData.name,
          description: workflowData.description || ""
        })
        setHasUnsavedChanges(false) // Reset unsaved changes after successful load

        toast({
          title: "Workflow Loaded",
          description: `Successfully loaded workflow "${workflowData.name}".`,
        })

        // Fit view after nodes are loaded
        setTimeout(() => {
          fitView({ padding: 0.2 })
        }, 100)

      } catch (error) {
        let errorMessage = "Failed to load workflow"
        let showRetry = false

        if (error instanceof WorkflowApiError) {
          if (error.status === 0) {
            errorMessage = "Network error - please check your internet connection"
            showRetry = true
          } else if (error.status === 404) {
            errorMessage = "Workflow not found - it may have been deleted"
          } else if (error.status >= 500) {
            errorMessage = "Server error - please try again later"
            showRetry = true
          } else {
            errorMessage = error.message
          }
        } else if (error instanceof Error) {
          errorMessage = error.message
          if (errorMessage.includes("offline")) {
            showRetry = false
          } else {
            showRetry = true
          }
        }
        
        setLoadError(errorMessage)
        
        // Load default nodes and edges as fallback
        setNodes(initialNodes)
        setEdges(initialEdges)
        
        toast({
          title: "Error Loading Workflow",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkflow()
  }, [workflowId, setNodes, setEdges, toast, fitView])

  // Get edge style based on type
  const getEdgeStyle = (edgeType: string) => {
    switch (edgeType) {
      case "on_success":
        return {
          stroke: "#22c55e",
          strokeWidth: 2,
          label: "on success",
          labelStyle: { fill: "#22c55e", fontWeight: 600 },
        }
      case "on_failure":
        return {
          stroke: "#ef4444",
          strokeWidth: 2,
          label: "on failure",
          labelStyle: { fill: "#ef4444", fontWeight: 600 },
        }
      case "on_true":
        return {
          stroke: "#22c55e",
          strokeWidth: 2,
          label: "true",
          labelStyle: { fill: "#22c55e", fontWeight: 600 },
        }
      case "on_false":
        return {
          stroke: "#ef4444",
          strokeWidth: 2,
          label: "false",
          labelStyle: { fill: "#ef4444", fontWeight: 600 },
        }
      default:
        return {
          stroke: "#000000",
          strokeWidth: 2,
        }
    }
  }

  // Convert canvas data to YAML workflow format (now uses backend payload)
  const convertToYamlWorkflow = useCallback(() => {
    const currentNodes = getNodes()
    const currentEdges = getEdges()
    const backendWorkflow = transformWorkflowToBackendPayload(currentNodes, currentEdges)
    return stringify(backendWorkflow, { indent: 2 })
  }, [getNodes, getEdges])

  // Handle YAML preview
  const handleYamlPreview = () => {
    setShowYamlPreview(true)
  }

  // Handle node selection - now shows details panel instead of config
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
      // Only open details panel for nodes that are NOT interactive_form_http
      setIsDetailsOpen(node.type !== "interactive_form_http")

      // Add visual feedback by highlighting the selected node
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
          style: {
            ...n.style,
            ...(n.id === node.id && {
              boxShadow: "0 0 0 2px #3b82f6",
              zIndex: 1000,
            }),
          },
        })),
      )
    },
    [setNodes],
  )

  // Add a handler to clear selection when clicking on canvas background
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setIsDetailsOpen(false)

    // Clear visual selection
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
        style: {
          ...n.style,
          boxShadow: undefined,
          zIndex: undefined,
        },
      })),
    )
  }, [setNodes])

  // Handle edge connection - now shows dialog for edge type selection
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = getNodes().find((n) => n.id === params.source)
      const targetNode = getNodes().find((n) => n.id === params.target)

      // Store the pending connection
      setPendingConnection({
        source: params.source!,
        target: params.target!,
        sourceNode: sourceNode || null,
        targetNode: targetNode || null,
      })

      // Show edge configuration dialog
      setShowEdgeDialog(true)
    },
    [getNodes],
  )

  // Handle edge type confirmation
  const handleEdgeConfirm = useCallback(
    (edgeType: string) => {
      if (!pendingConnection) return

      // Save current state to undo stack
      setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])
      setRedoStack([])

      const edgeStyle = getEdgeStyle(edgeType)
      const id = `e${pendingConnection.source}-${pendingConnection.target}-${edgeType}`

      const newEdge: Edge = {
        id,
        source: pendingConnection.source,
        target: pendingConnection.target,
        animated: true,
        data: { edgeType },
        style: { stroke: edgeStyle.stroke, strokeWidth: edgeStyle.strokeWidth },
        ...(edgeStyle.label && {
          label: edgeStyle.label,
          labelStyle: edgeStyle.labelStyle,
        }),
        markerEnd: {
          type: "arrowclosed",
          color: edgeStyle.stroke,
        },
      }

      setEdges((eds) => addEdge(newEdge, eds))
      setPendingConnection(null)

      toast({
        title: "Connection created",
        description: `Added ${edgeStyle.label || "default"} connection between nodes.`,
      })
    },
    [pendingConnection, getNodes, getEdges, setEdges, setUndoStack, setRedoStack, toast],
  )

  // Handle node update
  const onNodeUpdate = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  // Handle adding node from palette
  const handleAddNode = useCallback(
    (nodeType: string, nodeLabel: string, config: any, position: { x: number; y: number }) => {
      // Save current state to undo stack
      setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])
      setRedoStack([])

      // Create a new node with configuration
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: config.label || nodeLabel,
          ...config,
        },
      }

      setNodes((nds) => nds.concat(newNode))

      toast({
        title: "Node added",
        description: `${nodeLabel} has been added to the workflow.`,
      })
    },
    [getNodes, getEdges, setNodes, setUndoStack, setRedoStack, toast],
  )

  // Handle node drag
  const onNodeDragStop = useCallback(() => {
    // Save current state to undo stack
    setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])
    setRedoStack([])
  }, [getNodes, getEdges, setUndoStack, setRedoStack])

  // Handle context menu
  const onContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true,
    })
  }, [])

  // Handle click outside context menu
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu((cm) => ({ ...cm, visible: false }))
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  // Handle keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    // Undo: Ctrl+Z
    if (event.ctrlKey && event.key === "z") {
      handleUndo()
    }
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if ((event.ctrlKey && event.key === "y") || (event.ctrlKey && event.shiftKey && event.key === "z")) {
      handleRedo()
    }
    // Delete: Delete key
    if (event.key === "Delete" && selectedNode) {
      handleDeleteNode(selectedNode.id)
    }
  }

  // Handle undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return

    // Save current state to redo stack
    setRedoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])

    // Pop the last state from undo stack
    const lastState = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))

    // Apply the state
    setNodes(lastState.nodes)
    setEdges(lastState.edges)
  }, [undoStack, getNodes, getEdges, setNodes, setEdges])

  // Handle redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return

    // Save current state to undo stack
    setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])

    // Pop the last state from redo stack
    const lastState = redoStack[redoStack.length - 1]
    setRedoStack((stack) => stack.slice(0, -1))

    // Apply the state
    setNodes(lastState.nodes)
    setEdges(lastState.edges)
  }, [redoStack, getNodes, getEdges, setNodes, setEdges])

  // Handle node deletion
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      // Save current state to undo stack
      setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])
      setRedoStack([])

      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      // Remove connected edges
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))

      // Close details panel if the selected node is deleted
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null)
        setIsDetailsOpen(false)
      }
    },
    [getNodes, getEdges, setNodes, setEdges, selectedNode, setUndoStack, setRedoStack],
  )

  // Handle node addition from drag and drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow/type")
      const label = event.dataTransfer.getData("application/reactflow/label")

      // Check if the dropped element is valid
      if (!type || !label) {
        return
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      // Save current state to undo stack
      setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])
      setRedoStack([])

      // Create a new node
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: { label },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [project, getNodes, getEdges, setNodes, setUndoStack, setRedoStack],
  )

  // Handle export (React Flow JSON)
  const handleExport = () => {
    const workflow = {
      nodes: getNodes(),
      edges: getEdges(),
    }

    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `workflow-canvas-${workflowId || "new"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Canvas Exported",
      description: "Your canvas layout has been exported as JSON.",
    })
  }

  // Handle auto-layout
  const handleAutoLayout = () => {
    // This is a simple auto-layout that arranges nodes in a grid
    const nodeCount = getNodes().length
    const cols = Math.ceil(Math.sqrt(nodeCount))
    const spacing = 150

    setNodes((nds) =>
      nds.map((node, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        return {
          ...node,
          position: {
            x: col * spacing + 100,
            y: row * spacing + 100,
          },
        }
      }),
    )

    // Fit view after layout
    setTimeout(() => {
      fitView({ padding: 0.2 })
    }, 100)
  }

  // Handle Save Workflow (supports both create and update with comprehensive error handling)
  const handleSaveWorkflow = async () => {
    // Check offline status before attempting to save
    if (!isOnline) {
      toast({
        title: "Cannot Save Offline",
        description: "You're currently offline. Please check your internet connection and try again.",
        variant: "destructive",
      })
      return
    }

    // Check API health before attempting to save
    if (!apiHealthy) {
      toast({
        title: "Service Unavailable",
        description: "The workflow service is currently unavailable. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setLastSaveAttempt(new Date())
    
    try {
      const currentNodes = getNodes()
      const currentEdges = getEdges()

      // Transform to backend payload with current metadata
      const backendWorkflow: BackendWorkflow = transformWorkflowToBackendPayload(
        currentNodes, 
        currentEdges,
        workflowMetadata.name,
        workflowMetadata.description
      )

      let result
      const isUpdating = !!workflowId

      if (isUpdating) {
        // Update existing workflow with retry logic
        result = await withRetry(
          () => updateWorkflow(workflowId, backendWorkflow),
          3, // max retries
          1000 // base delay
        )
        toast({
          title: "Workflow Updated!",
          description: `Workflow "${result.name}" has been successfully updated.`,
        })
        setHasUnsavedChanges(false)
        // Stay on the same page - no navigation needed
      } else {
        // Create new workflow with retry logic
        result = await withRetry(
          () => createWorkflow(backendWorkflow),
          3, // max retries
          1000 // base delay
        )
        toast({
          title: "Workflow Created!",
          description: `Workflow "${result.name}" (ID: ${result.id}) has been successfully created.`,
        })
        setHasUnsavedChanges(false)
        // Navigate to the new workflow's canvas page
        router.push(`/workflow-canvas?id=${result.id}`)
      }

    } catch (error: any) {
      const isUpdating = !!workflowId
      const operation = isUpdating ? "updating" : "creating"
      
      let errorMessage = `An unexpected error occurred while ${operation} the workflow.`
      let showRetry = false

      if (error instanceof WorkflowApiError) {
        if (error.status === 0) {
          errorMessage = `Network error while ${operation} workflow. Please check your connection and try again.`
          showRetry = true
        } else if (error.status === 413) {
          errorMessage = "Workflow is too large. Please reduce the number of nodes or simplify the configuration."
        } else if (error.status === 422) {
          errorMessage = "Invalid workflow data. Please check your node configurations and try again."
        } else if (error.status >= 500) {
          errorMessage = `Server error while ${operation} workflow. Please try again later.`
          showRetry = true
        } else {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: `Error ${operation} workflow`,
        description: errorMessage,
        variant: "destructive",
      })
      console.error(`Error ${operation} workflow:`, error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete Workflow with comprehensive error handling
  const handleDeleteWorkflow = async () => {
    if (!workflowId) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete a workflow that hasn't been saved yet.",
        variant: "destructive",
      })
      return
    }

    // Check offline status before attempting to delete
    if (!isOnline) {
      toast({
        title: "Cannot Delete Offline",
        description: "You're currently offline. Please check your internet connection and try again.",
        variant: "destructive",
      })
      return
    }

    // Check API health before attempting to delete
    if (!apiHealthy) {
      toast({
        title: "Service Unavailable",
        description: "The workflow service is currently unavailable. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      // Use retry logic for deleting workflow
      await withRetry(
        () => deleteWorkflow(workflowId),
        3, // max retries
        1000 // base delay
      )
      
      toast({
        title: "Workflow Deleted!",
        description: `Workflow "${workflowMetadata.name}" has been successfully deleted.`,
      })
      
      // Navigate back to library after successful deletion
      router.push("/library")
      
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred while deleting the workflow."

      if (error instanceof WorkflowApiError) {
        if (error.status === 0) {
          errorMessage = "Network error while deleting workflow. Please check your connection and try again."
        } else if (error.status === 404) {
          errorMessage = "Workflow not found - it may have already been deleted."
          // Still navigate away since the workflow doesn't exist
          setTimeout(() => router.push("/library"), 2000)
        } else if (error.status === 403) {
          errorMessage = "You don't have permission to delete this workflow."
        } else if (error.status >= 500) {
          errorMessage = "Server error while deleting workflow. Please try again later."
        } else {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error deleting workflow",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Error deleting workflow:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedNode])

  // Show loading screen while workflow is being loaded
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={workflowId ? `/workflow/${workflowId}` : "/library"}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Workflow Canvas</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Loading Workflow</h2>
            <p className="text-muted-foreground">
              {workflowId ? "Fetching workflow data from server..." : "Initializing canvas..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={workflowId ? `/workflow/${workflowId}` : "/library"}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{workflowMetadata.name}</h1>
            {workflowMetadata.description && (
              <p className="text-sm text-muted-foreground">{workflowMetadata.description}</p>
            )}
          </div>
          {loadError && (
            <div className="flex items-center space-x-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Load Error</span>
            </div>
          )}
          {!isOnline && (
            <div className="flex items-center space-x-1 text-destructive">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Offline</span>
            </div>
          )}
          {isOnline && !apiHealthy && (
            <div className="flex items-center space-x-1 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Service Unavailable</span>
            </div>
          )}
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-1 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Unsaved Changes</span>
            </div>
          )}
        </div>

        <CollaborationIndicator count={2} />

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length === 0}>
            <Undo className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
            <Redo className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleYamlPreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview YAML
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Export Canvas JSON</span>
          </Button>
          {workflowId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Delete Workflow</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{workflowMetadata.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteWorkflow}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button size="sm" onClick={handleSaveWorkflow} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {workflowId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {workflowId ? "Update Workflow" : "Create Workflow"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node palette */}
        <NodePalette
          isOpen={isPaletteOpen}
          onToggle={() => setIsPaletteOpen(!isPaletteOpen)}
          onAddNode={handleAddNode}
        />

        {/* Canvas */}
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={onNodeDragStop}
            onContextMenu={onContextMenu}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            connectionLineType={ConnectionLineType.Step}
            connectionLineStyle={{
              strokeWidth: 2,
              stroke: "#6b7280",
            }}
            defaultEdgeOptions={{
              type: "step",
              style: {
                strokeWidth: 2,
                stroke: "#6b7280",
              },
              markerEnd: {
                type: "arrowclosed",
                color: "#6b7280",
              },
            }}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-right">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => fitView({ padding: 0.2 })}>
                  <ZoomIn className="h-4 w-4" />
                  <span className="sr-only">Fit View</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleAutoLayout}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Auto Layout</span>
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Node details panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            onUpdate={(data) => onNodeUpdate(selectedNode.id, data)}
            onDelete={() => handleDeleteNode(selectedNode.id)}
          />
        )}

        {/* Context menu */}
        {contextMenu.visible && (
          <CanvasContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onAutoLayout={handleAutoLayout}
            onExportImage={() => {
              // Implement export as image
              toast({
                title: "Export as Image",
                description: "This feature is coming soon.",
              })
            }}
          />
        )}
      </div>

      {/* Edge Configuration Dialog */}
      <ConditionalEdgeDialog
        isOpen={showEdgeDialog}
        onClose={() => {
          setShowEdgeDialog(false)
          setPendingConnection(null)
        }}
        sourceNode={pendingConnection?.sourceNode || null}
        targetNode={pendingConnection?.targetNode || null}
        onConfirm={handleEdgeConfirm}
      />

      {/* YAML Preview Modal */}
      <YamlPreview yaml={convertToYamlWorkflow()} isOpen={showYamlPreview} onClose={() => setShowYamlPreview(false)} />
    </div>
  )
}

export default function WorkflowCanvasPage() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasContent />
    </ReactFlowProvider>
  )
}


























