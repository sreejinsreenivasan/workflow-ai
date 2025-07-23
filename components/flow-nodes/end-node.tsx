"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { CircleStop } from "lucide-react"
import { Badge } from "@/components/ui/badge" // Import Badge

export const EndNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-red-500 min-w-[150px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-red-500" />
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <CircleStop className="w-4 h-4 text-red-500 mr-2" />
          <div className="font-bold">{data.label}</div>
        </div>
        <Badge variant="secondary" className="text-xs px-2 py-0.5">
          End
        </Badge>{" "}
        {/* Added Badge */}
      </div>
    </div>
  )
})

EndNode.displayName = "EndNode"
