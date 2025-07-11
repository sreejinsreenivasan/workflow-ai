"use client"

import { useState, useEffect } from "react"
import type { Node } from "reactflow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Trash } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  // Update the NodeConfigPanel to handle all node types properly and show appropriate configuration forms
  const renderForm = () => {
    switch (node.type) {
      case "start":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
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

      case "http_call":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://api.example.com/endpoint"
                value={formData.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <Select value={formData.method || "GET"} onValueChange={(value) => handleChange("method", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (s)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={formData.timeout || 30}
                  onChange={(e) => handleChange("timeout", Number.parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Textarea
                id="headers"
                rows={3}
                placeholder='{"Authorization": "Bearer token"}'
                value={
                  formData.headers
                    ? typeof formData.headers === "string"
                      ? formData.headers
                      : JSON.stringify(formData.headers, null, 2)
                    : ""
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleChange("headers", parsed)
                  } catch {
                    handleChange("headers", e.target.value)
                  }
                }}
              />
            </div>
          </div>
        )

      case "ai_copilot":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={formData.model || "gpt-4o"} onValueChange={(value) => handleChange("model", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt Template</Label>
              <Textarea
                id="prompt"
                rows={4}
                placeholder="Process the following data: {{input}}"
                value={formData.prompt || ""}
                onChange={(e) => handleChange("prompt", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature || 0.7}
                  onChange={(e) => handleChange("temperature", Number.parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={formData.maxTokens || 1000}
                  onChange={(e) => handleChange("maxTokens", Number.parseInt(e.target.value))}
                />
              </div>
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
                placeholder="data.status === 'approved'"
                value={formData.condition || ""}
                onChange={(e) => handleChange("condition", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a JavaScript expression that evaluates to true or false.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        )

      case "timer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || 1}
                  onChange={(e) => handleChange("duration", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit || "minutes"} onValueChange={(value) => handleChange("unit", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                placeholder="user@example.com"
                value={formData.to || ""}
                onChange={(e) => handleChange("to", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={formData.subject || ""}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                rows={4}
                placeholder="Email content..."
                value={formData.body || ""}
                onChange={(e) => handleChange("body", e.target.value)}
              />
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
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
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
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
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
