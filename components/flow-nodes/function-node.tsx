"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

export const FunctionNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
      <div className="flex flex-col">
        <div className="font-bold">{data.label}</div>
        {data.parameters && (
          <div className="text-xs text-gray-500 mt-1">
            {typeof data.parameters === "string"
              ? data.parameters
              : Object.entries(data.parameters)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-blue-500" />
    </div>
  )
})

FunctionNode.displayName = "FunctionNode"
