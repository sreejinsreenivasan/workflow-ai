"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
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
  type Node,
  type NodeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  ConnectionLineType,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Download, ZoomIn, Undo, Redo, MoreHorizontal, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { NodePalette } from "@/components/node-palette"
import { NodeDetailsPanel } from "@/components/node-details-panel"
import { CanvasContextMenu } from "@/components/canvas-context-menu"
import { CollaborationIndicator } from "@/components/collaboration-indicator"
import { YamlPreview } from "@/components/yaml-preview"
import { ConditionalEdgeDialog } from "@/components/conditional-edge-dialog"
import { StartNode } from "@/components/flow-nodes/start-node"
import { FunctionNode } from "@/components/flow-nodes/function-node"
import { ConditionNode } from "@/components/flow-nodes/condition-node"
import { EndNode } from "@/components/flow-nodes/end-node"
import { InteractiveFormHttpNode } from "@/components/flow-nodes/interactive-form-http-node"
import { HttpRequestNode } from "@/components/flow-nodes/http-request-node" // New import
import { stringify, parse } from "yaml"
import { transformWorkflowToBackendPayload } from "@/lib/workflow-transformer"

// Define custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  function: FunctionNode,
  condition: ConditionNode,
  end: EndNode,
  http_request: HttpRequestNode, // Changed from http_call
  ai_copilot: FunctionNode,
  form: FunctionNode,
  timer: FunctionNode,
  email: FunctionNode,
  webhook: FunctionNode,
  database: FunctionNode,
  file_upload: FunctionNode,
  custom_subgraph: FunctionNode,
  interactive_form_http: InteractiveFormHttpNode,
}

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "1",
    type: "start",
    position: { x: 250, y: 50 },
    data: { label: "Start Onboarding" },
  },
  {
    id: "2",
    type: "interactive_form_http",
    position: { x: 250, y: 150 },
    data: {
      label: "User Registration",
      formFields: [
        { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
        { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
        { name: "password", label: "Password", type: "password" },
      ],
      httpMethod: "POST",
      httpUrl: "https://api.example.com/register",
      httpBodyTemplate: '{"name": "{{name}}", "email": "{{email}}", "password": "{{password}}"}',
      errorMapping: {
        email: "email",
        name: "name",
        password: "password",
      },
    },
  },
  {
    id: "3",
    type: "http_request", // Example of the new node type
    position: { x: 500, y: 150 },
    data: {
      label: "Fetch User Data",
      method: "GET",
      url: "https://api.example.com/users/{{userId}}",
      timeout: 60,
      headers: [{ key: "Authorization", value: "Bearer {{token}}" }],
    },
  },
  {
    id: "4",
    type: "condition",
    position: { x: 250, y: 250 },
    data: { label: "Validate Basic Info", condition: "data.email && data.name && data.phone" },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    animated: true,
    data: { edgeType: "on_success" },
    style: { stroke: "#22c55e", strokeWidth: 2 },
    label: "on success",
    labelStyle: { fill: "#22c55e", fontWeight: 600 },
  },
  { id: "e3-4", source: "3", target: "4", animated: true }, // Connect new HTTP Request node
]

function WorkflowCanvasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
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
  const [isSubmitting, setIsSubmitting] = useState(false) // New state for submission loading
  const { project, fitView, getNodes, getEdges } = useReactFlow()

  // Get workflow ID from query params
  const workflowId = searchParams.get("id")

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

  // Convert canvas data to YAML workflow format
  const convertToYamlWorkflow = useCallback(() => {
    const currentNodes = getNodes()
    const currentEdges = getEdges()

    // Create a map of node connections with edge types
    const nodeConnections = new Map<
      string,
      {
        next?: string
        onSuccess?: string
        onFailure?: string
        onTrue?: string
        onFalse?: string
      }
    >()

    currentEdges.forEach((edge) => {
      const sourceId = edge.source
      const targetId = edge.target
      const edgeType = edge.data?.edgeType || "default"

      const existingConnections = nodeConnections.get(sourceId) || {}

      switch (edgeType) {
        case "on_success":
          existingConnections.onSuccess = targetId
          break
        case "on_failure":
          existingConnections.onFailure = targetId
          break
        case "on_true":
          existingConnections.onTrue = targetId
          break
        case "on_false":
          existingConnections.onFalse = targetId
          break
        default:
          existingConnections.next = targetId
          break
      }

      nodeConnections.set(sourceId, existingConnections)
    })

    // Convert nodes to workflow steps
    const steps = currentNodes.map((node) => {
      const connections = nodeConnections.get(node.id) || {}
      const baseStep = {
        id: node.id,
        name: node.data.label || `Step ${node.id}`,
        type: node.type,
      }

      // Add type-specific properties
      switch (node.type) {
        case "start":
          return {
            ...baseStep,
            next: connections.next || null,
          }

        case "function":
        case "ai_copilot":
        case "form":
        case "timer":
        case "email":
        case "webhook":
        case "database":
        case "file_upload":
        case "custom_subgraph":
          return {
            ...baseStep,
            ...(node.data.parameters && { parameters: node.data.parameters }),
            ...(node.data.description && { description: node.data.description }),
            ...(connections.next && { next: connections.next }),
            ...(connections.onSuccess && { onSuccess: connections.onSuccess }),
            ...(connections.onFailure && { onFailure: connections.onFailure }),
          }
        case "http_request": // Handle the new http_request node type
          return {
            ...baseStep,
            method: node.data.method,
            url: node.data.url,
            ...(node.data.timeout && { timeout: node.data.timeout }),
            ...(node.data.headers && { headers: node.data.headers }),
            ...(node.data.body && { body: node.data.body }),
            ...(node.data.contentType && { contentType: node.data.contentType }),
            ...(node.data.authType && { authType: node.data.authType }),
            ...(node.data.token && { token: node.data.token }),
            ...(node.data.username && { username: node.data.username }),
            ...(node.data.password && { password: node.data.password }),
            ...(node.data.apiKeyName && { apiKeyName: node.data.apiKeyName }),
            ...(node.data.apiKeyValue && { apiKeyValue: node.data.apiKeyValue }),
            ...(connections.next && { next: connections.next }),
            ...(connections.onSuccess && { onSuccess: connections.onSuccess }),
            ...(connections.onFailure && { onFailure: connections.onFailure }),
          }
        case "interactive_form_http":
          return {
            ...baseStep,
            formFields: node.data.formFields,
            httpMethod: node.data.httpMethod,
            httpUrl: node.data.httpUrl,
            ...(node.data.httpBodyTemplate && { httpBodyTemplate: node.data.httpBodyTemplate }),
            ...(node.data.errorMapping && { errorMapping: node.data.errorMapping }),
            ...(connections.next && { next: connections.next }),
            ...(connections.onSuccess && { onSuccess: connections.onSuccess }),
            ...(connections.onFailure && { onFailure: connections.onFailure }),
          }

        case "condition":
          return {
            ...baseStep,
            condition: node.data.condition || "true",
            ...(connections.onTrue && { onTrue: connections.onTrue }),
            ...(connections.onFalse && { onFalse: connections.onFalse }),
          }

        case "end":
          return {
            ...baseStep,
            next: null,
          }

        default:
          return {
            ...baseStep,
            next: connections.next || null,
          }
      }
    })

    // Create the complete workflow object
    const workflow = {
      name: "Canvas Workflow", // Default name, could be made configurable
      description: "Workflow created using the visual canvas editor", // Default description
      version: "1.0",
      triggers: [
        {
          type: "webhook",
          config: {
            url: "/api/triggers/canvas-workflow",
          },
        },
      ],
      steps: steps,
    }

    return stringify(workflow, { indent: 2 })
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

  // Handle save
  const handleSave = () => {
    // Here you would save the workflow to your backend
    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully.",
    })
  }

  // Handle export
  const handleExport = () => {
    const workflow = {
      nodes: getNodes(),
      edges: getEdges(),
    }

    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `workflow-${workflowId || "new"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  // Handle Save & Submit Workflow
  const handleSubmitWorkflow = async () => {
    setIsSubmitting(true)
    try {
      const yamlWorkflow = convertToYamlWorkflow()
      const parsedWorkflow = parse(yamlWorkflow) // Parse YAML string to JS object

      // Extract name and description from the parsed workflow
      const workflowName = parsedWorkflow.name || "Untitled Workflow"
      const workflowDescription = parsedWorkflow.description || "Workflow created from canvas."

      const workflowPayload = transformWorkflowToBackendPayload({
        name: workflowName,
        description: workflowDescription,
        steps: parsedWorkflow.steps,
      })

      const response = await fetch("https://dev-workflow.pixl.ai/api/workflows/definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflowPayload),
      })

      if (!response) throw new Error("Network error: could not reach the workflow API.")

      if (!response.ok) {
        const errorData = await response.json()

        // FastAPI validation errors come back as an array in `detail`.
        let readableMessage = "Failed to create workflow."
        if (Array.isArray(errorData?.detail)) {
          readableMessage = errorData.detail
            .map(
              (d: any) =>
                // `loc` is usually an array like ["body", "steps", 0, "action_type"]
                `${Array.isArray(d.loc) ? d.loc.join(".") : d.loc}: ${d.msg}`,
            )
            .join("\n")
        } else if (typeof errorData?.detail === "string") {
          readableMessage = errorData.detail
        } else {
          // Fallback – stringify the entire payload for debugging
          readableMessage = JSON.stringify(errorData, null, 2)
        }

        throw new Error(readableMessage)
      }

      const result = await response.json()
      toast({
        title: "Workflow Submitted!",
        description: `Workflow "${result.name}" (ID: ${result.id}) has been successfully created.`,
      })
      router.push(`/workflow/${result.id}`) // Redirect to the new workflow's page
    } catch (error: any) {
      toast({
        title: "Error submitting workflow",
        description: error?.message ?? "An unexpected error occurred.",
        variant: "destructive",
      })
      console.error("Error submitting workflow:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedNode])

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
          <h1 className="text-xl font-bold">Workflow Canvas</h1>
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
            <span className="sr-only">Export</span>
          </Button>
          <Button size="sm" onClick={handleSubmitWorkflow} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save & Submit
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
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
          <NodeDetailsPanel
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
