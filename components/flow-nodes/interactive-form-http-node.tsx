"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FormInput, Globe } from "lucide-react" // Removed ArrowRight as it's not needed for this compact view

interface InteractiveFormHttpNodeData {
  label: string
  formFields: Array<{ name: string; label: string; type: string; placeholder?: string }>
  httpMethod: string
  httpUrl: string
  httpBodyTemplate?: string
  errorMapping?: Record<string, string> // Maps HTTP error keys to form field names
}

export const InteractiveFormHttpNode = memo(({ data, isConnectable }: NodeProps<InteractiveFormHttpNodeData>) => {
  return (
    <Card className="shadow-md rounded-md border-2 border-purple-500 min-w-[250px] max-w-[280px]">
      {" "}
      {/* Adjusted min/max width */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-purple-500" />
      <CardHeader className="p-3 pb-1">
        {" "}
        {/* Reduced padding */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FormInput className="w-5 h-5 text-purple-500" />
            <Globe className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-base font-bold">{data.label}</CardTitle> {/* Reduced font size */}
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            Interactive Form & HTTP Call
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 text-sm space-y-2">
        {" "}
        {/* Reduced padding and space-y */}
        {/* Form Fields Summary */}
        <div className="flex items-center gap-2">
          <FormInput className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {data.formFields && data.formFields.length > 0
              ? `${data.formFields.length} Form Field${data.formFields.length > 1 ? "s" : ""}`
              : "No Form Fields"}
          </span>
        </div>
        {/* HTTP Request Summary */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Badge variant="outline" className="font-mono px-1 py-0 text-xs">
            {data.httpMethod || "GET"}
          </Badge>
          <span className="text-muted-foreground truncate">
            {data.httpUrl ? new URL(data.httpUrl).hostname : "No URL"} {/* Show hostname or "No URL" */}
          </span>
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-purple-500"
      />
    </Card>
  )
})

InteractiveFormHttpNode.displayName = "InteractiveFormHttpNode"
