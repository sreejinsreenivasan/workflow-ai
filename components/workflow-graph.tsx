"use client"

import { useEffect, useState } from "react"
import ReactFlow, { MiniMap, Controls, Background, type Node, type Edge } from "reactflow"
import "reactflow/dist/style.css"
import { StartNode } from "@/components/flow-nodes/start-node"
import { FunctionNode } from "@/components/flow-nodes/function-node"
import { ConditionNode } from "@/components/flow-nodes/condition-node"
import { EndNode } from "@/components/flow-nodes/end-node"

// Define custom node types
const nodeTypes = {
  start: StartNode,
  function: FunctionNode,
  condition: ConditionNode,
  end: EndNode,
}

interface WorkflowGraphProps {
  workflow: any
}

export function WorkflowGraph({ workflow }: WorkflowGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    if (!workflow || !workflow.steps) return

    // Convert workflow steps to nodes and edges
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    const nodePositions: Record<string, { x: number; y: number }> = {}

    // First pass: create nodes
    workflow.steps.forEach((step: any, index: number) => {
      // Simple positioning algorithm
      const position = { x: 250, y: index * 100 + 50 }
      nodePositions[step.id] = position

      const node: Node = {
        id: step.id,
        type: step.type,
        position,
        data: {
          label: step.name,
          ...step,
        },
      }

      newNodes.push(node)
    })

    // Second pass: create edges
    workflow.steps.forEach((step: any) => {
      if (step.next) {
        newEdges.push({
          id: `e-${step.id}-${step.next}`,
          source: step.id,
          target: step.next,
          animated: true,
        })
      }

      if (step.type === "condition") {
        if (step.onTrue) {
          newEdges.push({
            id: `e-${step.id}-${step.onTrue}-true`,
            source: step.id,
            target: step.onTrue,
            animated: true,
            label: "True",
          })
        }

        if (step.onFalse) {
          newEdges.push({
            id: `e-${step.id}-${step.onFalse}-false`,
            source: step.id,
            target: step.onFalse,
            animated: true,
            label: "False",
          })
        }
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [workflow])

  if (!workflow || !workflow.steps) {
    return <div className="flex items-center justify-center h-full">No workflow data available</div>
  }

  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView attributionPosition="bottom-right">
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
