"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { CirclePlay } from "lucide-react"
import { Badge } from "@/components/ui/badge" // Import Badge

export const StartNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <CirclePlay className="w-4 h-4 text-green-500 mr-2" />
          <div className="font-bold">{data.label}</div>
        </div>
        <Badge variant="secondary" className="text-xs px-2 py-0.5">
          Start
        </Badge>{" "}
        {/* Added Badge */}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-green-500" />
    </div>
  )
})

StartNode.displayName = "StartNode"
