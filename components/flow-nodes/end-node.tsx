"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

export const EndNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-red-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-red-500" />
      <div className="flex items-center">
        <div className="rounded-full w-3 h-3 bg-red-500 mr-2" />
        <div className="font-bold">{data.label}</div>
      </div>
    </div>
  )
})

EndNode.displayName = "EndNode"
