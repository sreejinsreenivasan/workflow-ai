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
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Download, ZoomIn, Undo, Redo, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { NodePalette } from "@/components/node-palette"
import { NodeConfigPanel } from "@/components/node-config-panel"
import { CanvasContextMenu } from "@/components/canvas-context-menu"
import { CollaborationIndicator } from "@/components/collaboration-indicator"
import { StartNode } from "@/components/flow-nodes/start-node"
import { FunctionNode } from "@/components/flow-nodes/function-node"
import { ConditionNode } from "@/components/flow-nodes/condition-node"
import { EndNode } from "@/components/flow-nodes/end-node"

// Define custom node types
const nodeTypes: NodeTypes = {
  start: StartNode,
  function: FunctionNode,
  condition: ConditionNode,
  end: EndNode,
}

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "1",
    type: "start",
    position: { x: 250, y: 50 },
    data: { label: "Start" },
  },
  {
    id: "2",
    type: "function",
    position: { x: 250, y: 150 },
    data: { label: "Process Data", parameters: { input: "data", transformation: "normalize" } },
  },
  {
    id: "3",
    type: "condition",
    position: { x: 250, y: 250 },
    data: { label: "Validate Data", condition: "data.valid === true" },
  },
  {
    id: "4",
    type: "function",
    position: { x: 100, y: 350 },
    data: { label: "Error Path", parameters: { action: "retry" } },
  },
  {
    id: "5",
    type: "end",
    position: { x: 400, y: 350 },
    data: { label: "Complete" },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true, label: "False" },
  { id: "e3-5", source: "3", target: "5", animated: true, label: "True" },
]

function WorkflowCanvasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const [isPaletteOpen, setIsPaletteOpen] = useState(true)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([])

  const { project, fitView, getNodes, getEdges } = useReactFlow()

  // Get workflow ID from query params
  const workflowId = searchParams.get("id")

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setIsConfigOpen(true)
  }, [])

  // Handle edge connection
  const onConnect = useCallback(
    (params: Connection) => {
      // Save current state to undo stack
      setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])
      setRedoStack([])

      // Create a unique edge ID
      const id = `e${params.source}-${params.target}`
      setEdges((eds) => addEdge({ ...params, id, animated: true }, eds))
    },
    [getNodes, getEdges, setEdges, setUndoStack, setRedoStack],
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
  useEffect(() => {
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

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedNode])

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return

    // Save current state to redo stack
    setRedoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])

    // Pop the last state from undo stack
    const lastState = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))

    // Apply the state
    setNodes(lastState.nodes)
    setEdges(lastState.edges)
  }

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return

    // Save current state to undo stack
    setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])

    // Pop the last state from redo stack
    const lastState = redoStack[redoStack.length - 1]
    setRedoStack((stack) => stack.slice(0, -1))

    // Apply the state
    setNodes(lastState.nodes)
    setEdges(lastState.edges)
  }

  // Handle node deletion
  const handleDeleteNode = (nodeId: string) => {
    // Save current state to undo stack
    setUndoStack((stack) => [...stack, { nodes: getNodes(), edges: getEdges() }])
    setRedoStack([])

    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    // Remove connected edges
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))

    // Close config panel if the selected node is deleted
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
      setIsConfigOpen(false)
    }
  }

  // Handle node addition from palette
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Export</span>
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node palette */}
        <NodePalette isOpen={isPaletteOpen} onToggle={() => setIsPaletteOpen(!isPaletteOpen)} />

        {/* Canvas */}
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            onContextMenu={onContextMenu}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
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

        {/* Node configuration panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
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
