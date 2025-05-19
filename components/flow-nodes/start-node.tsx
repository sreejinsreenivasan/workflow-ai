"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

export const StartNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full w-3 h-3 bg-green-500 mr-2" />
        <div className="font-bold">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-green-500" />
    </div>
  )
})

StartNode.displayName = "StartNode"
