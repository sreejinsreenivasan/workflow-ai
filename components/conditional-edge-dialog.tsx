"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ConditionalEdgeDialogProps {
  isOpen: boolean
  onClose: () => void
  sourceNode: any
  targetNode: any
  onConfirm: (edgeType: string) => void
}

export function ConditionalEdgeDialog({
  isOpen,
  onClose,
  sourceNode,
  targetNode,
  onConfirm,
}: ConditionalEdgeDialogProps) {
  const [edgeType, setEdgeType] = useState<string>("default")

  const handleConfirm = () => {
    onConfirm(edgeType)
    onClose()
  }

  const handleCancel = () => {
    setEdgeType("default")
    onClose()
  }

  // Determine available edge types based on source node
  const getAvailableEdgeTypes = () => {
    if (!sourceNode) return [{ value: "default", label: "Default", description: "Normal flow" }]

    switch (sourceNode.type) {
      case "condition":
        return [
          { value: "on_true", label: "On True", description: "When condition evaluates to true" },
          { value: "on_false", label: "On False", description: "When condition evaluates to false" },
        ]
      case "function":
      case "http_call":
      case "ai_copilot":
      case "form":
      case "timer":
      case "email":
      case "webhook":
      case "database":
      case "file_upload":
        return [
          { value: "on_success", label: "On Success", description: "When operation completes successfully" },
          { value: "on_failure", label: "On Failure", description: "When operation fails or encounters an error" },
          { value: "default", label: "Default", description: "Normal flow (same as success)" },
        ]
      default:
        return [{ value: "default", label: "Default", description: "Normal flow" }]
    }
  }

  const availableTypes = getAvailableEdgeTypes()

  // Get edge color based on type
  const getEdgeColor = (type: string) => {
    switch (type) {
      case "on_success":
      case "on_true":
        return "#22c55e" // green
      case "on_failure":
      case "on_false":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Connection Details</Label>
            <div className="p-3 bg-muted rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">From:</span>
                <Badge variant="outline">{sourceNode?.data?.label || sourceNode?.id}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">To:</span>
                <Badge variant="outline">{targetNode?.data?.label || targetNode?.id}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edgeType">Connection Type</Label>
            <Select value={edgeType} onValueChange={setEdgeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select connection type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEdgeColor(type.value) }} />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {edgeType !== "default" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEdgeColor(edgeType) }} />
                <span className="text-sm font-medium">{availableTypes.find((t) => t.value === edgeType)?.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {availableTypes.find((t) => t.value === edgeType)?.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Create Connection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
