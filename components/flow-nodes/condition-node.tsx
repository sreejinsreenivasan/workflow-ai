"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

export const ConditionNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-amber-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-amber-500" />
      <div className="flex flex-col">
        <div className="font-bold">{data.label}</div>
        {data.condition && <div className="text-xs text-gray-500 mt-1">{data.condition}</div>}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "25%" }}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "75%" }}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-red-500"
      />
    </div>
  )
})

ConditionNode.displayName = "ConditionNode"
