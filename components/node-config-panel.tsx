"use client"

import { useState, useEffect } from "react"
import type { Node } from "reactflow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Trash } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NodeConfigPanelProps {
  node: Node
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete: () => void
}

export function NodeConfigPanel({ node, isOpen, onClose, onUpdate, onDelete }: NodeConfigPanelProps) {
  const [formData, setFormData] = useState<any>({})

  // Initialize form data when node changes
  useEffect(() => {
    setFormData({ ...node.data })
  }, [node])

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [key]: value }
      onUpdate(newData)
      return newData
    })
  }

  // Render different forms based on node type
  const renderForm = () => {
    switch (node.type) {
      case "start":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
          </div>
        )

      case "function":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parameters">Parameters (JSON)</Label>
              <Textarea
                id="parameters"
                rows={5}
                value={
                  formData.parameters
                    ? typeof formData.parameters === "string"
                      ? formData.parameters
                      : JSON.stringify(formData.parameters, null, 2)
                    : ""
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleChange("parameters", parsed)
                  } catch {
                    // If not valid JSON, store as string
                    handleChange("parameters", e.target.value)
                  }
                }}
              />
            </div>
          </div>
        )

      case "condition":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Textarea
                id="condition"
                rows={3}
                value={formData.condition || ""}
                onChange={(e) => handleChange("condition", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a JavaScript expression that evaluates to true or false.
              </p>
            </div>
          </div>
        )

      case "end":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-80 border-l bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Node Configuration</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Node Type</Label>
            <div className="p-2 bg-muted rounded-md text-sm">{node.type}</div>
          </div>

          <div className="space-y-2">
            <Label>Node ID</Label>
            <div className="p-2 bg-muted rounded-md text-sm">{node.id}</div>
          </div>

          {renderForm()}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="destructive" className="w-full" onClick={onDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete Node
        </Button>
      </div>
    </div>
  )
}
