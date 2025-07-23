"use client"

import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Globe } from "lucide-react"

export function HttpRequestNode({ data, selected }: NodeProps) {
  return (
    <Card
      className={cn(
        "w-48 shadow-md transition-all duration-200",
        selected ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <Globe className="h-4 w-4 text-blue-500" />
          {data.label || "HTTP Request"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-foreground">{data.method || "GET"}</span>
          <span className="truncate">{data.url || "No URL"}</span>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400" />
    </Card>
  )
}
