"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TreePicker } from "@/components/tree-picker"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Trash2, Link, Plus, Minus } from "lucide-react"
import type { Node } from "reactflow"
import type { PreviousWorkflowNode, CurrentNodeInputField } from "@/types/workflow"

interface NodeConfigPanelProps {
  node: Node
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete: () => void
}

export function NodeConfigPanel({ node, isOpen, onClose, onUpdate, onDelete }: NodeConfigPanelProps) {
  const [localData, setLocalData] = useState(node.data)
  const [showTreePicker, setShowTreePicker] = useState(false)
  const [currentMappingField, setCurrentMappingField] = useState<string>("")

  // Initialize localData when node changes
  useEffect(() => {
    setLocalData(node.data)
  }, [node])

  // Mock data for TreePicker - in a real app, this would come from the workflow context
  const mockPreviousNodes: PreviousWorkflowNode[] = [
    {
      id: "start-node-1",
      label: "Workflow Start",
      type: "START",
      outputs: {
        startTime: {
          key: "startTime",
          label: "Start Time",
          type: "string",
          description: "Timestamp when workflow started.",
        },
        initialPayload: {
          key: "initialPayload",
          label: "Initial Payload",
          type: "object",
          description: "Data provided at workflow initiation.",
          children: [
            { key: "userId", label: "User ID", type: "string", description: "ID of the user." },
            { key: "orderId", label: "Order ID", type: "string", description: "ID of the order." },
            {
              key: "customerInfo",
              label: "Customer Information",
              type: "object",
              children: [
                { key: "name", label: "Name", type: "string" },
                { key: "email", label: "Email", type: "string" },
                { key: "address", label: "Address", type: "string" },
              ],
            },
          ],
        },
      },
    },
    {
      id: "task-node-1",
      label: "Process Data",
      type: "TASK",
      outputs: {
        processedResult: {
          key: "processedResult",
          label: "Processed Result",
          type: "string",
          description: "Output after data processing.",
        },
        status: {
          key: "status",
          label: "Status",
          type: "string",
          description: "Status of the processing (e.g., 'success', 'failed').",
        },
        dataCount: { key: "dataCount", label: "Data Count", type: "number", description: "Number of items processed." },
      },
    },
    {
      id: "http-request-node-1",
      label: "Fetch User Data",
      type: "HTTP_REQUEST",
      outputs: {
        responseBody: {
          key: "responseBody",
          label: "HTTP Response Body",
          type: "object",
          description: "The body of the HTTP response.",
          children: [
            { key: "username", label: "Username", type: "string" },
            { key: "email", label: "User Email", type: "string" },
            {
              key: "profile",
              label: "User Profile",
              type: "object",
              children: [
                { key: "age", label: "Age", type: "number" },
                { key: "country", label: "Country", type: "string" },
              ],
            },
          ],
        },
        statusCode: { key: "statusCode", label: "Status Code", type: "number", description: "HTTP status code." },
      },
    },
  ]

  const mockCurrentNodeInputs: CurrentNodeInputField[] = [
    { name: "inputData", label: "Input Data", type: "string", description: "Data to be processed by this node." },
    {
      name: "configParam",
      label: "Configuration Parameter",
      type: "number",
      description: "A numerical configuration.",
    },
    {
      name: "userEmail",
      label: "User Email for Notification",
      type: "string",
      description: "Email address to send notifications.",
    },
  ]

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value }
    setLocalData(updatedData)
    onUpdate(updatedData)
  }

  const handleArrayAdd = (field: string) => {
    const currentArray = localData[field] || []
    const updatedArray = [...currentArray, { key: "", value: "" }]
    handleInputChange(field, updatedArray)
  }

  const handleArrayRemove = (field: string, index: number) => {
    const currentArray = localData[field] || []
    const updatedArray = currentArray.filter((_: any, i: number) => i !== index)
    handleInputChange(field, updatedArray)
  }

  const handleArrayItemChange = (field: string, index: number, itemField: string, value: any) => {
    const currentArray = localData[field] || []
    const updatedArray = [...currentArray]
    updatedArray[index] = { ...updatedArray[index], [itemField]: value }
    handleInputChange(field, updatedArray)
  }

  const openTreePicker = (fieldName: string) => {
    setCurrentMappingField(fieldName)
    setShowTreePicker(true)
  }

  const handleMappingsChange = (newMappings: Record<string, string>) => {
    if (currentMappingField && newMappings[currentMappingField]) {
      handleInputChange(currentMappingField, newMappings[currentMappingField])
    }
  }

  const renderNodeSpecificFields = () => {
    switch (node.type) {
      case "start":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what this start node does..."
              />
            </div>
          </div>
        )

      case "function":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what this function does..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="parameters">Parameters (JSON)</Label>
                <Button variant="ghost" size="sm" onClick={() => openTreePicker("parameters")} className="h-8 w-8 p-0">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="parameters"
                value={
                  typeof localData.parameters === "string"
                    ? localData.parameters
                    : JSON.stringify(localData.parameters || {}, null, 2)
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleInputChange("parameters", parsed)
                  } catch {
                    handleInputChange("parameters", e.target.value)
                  }
                }}
                placeholder="Enter function parameters as JSON..."
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </div>
        )

      case "condition":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what this condition checks..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="condition">Condition Expression</Label>
                <Button variant="ghost" size="sm" onClick={() => openTreePicker("condition")} className="h-8 w-8 p-0">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="condition"
                value={localData.condition || ""}
                onChange={(e) => handleInputChange("condition", e.target.value)}
                placeholder="e.g., data.status === 'approved'"
                className="font-mono text-sm"
              />
            </div>
          </div>
        )

      case "http_request":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="method">Method</Label>
                <Select value={localData.method || "GET"} onValueChange={(value) => handleInputChange("method", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={localData.timeout || 60}
                  onChange={(e) => handleInputChange("timeout", Number.parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="url">URL</Label>
                <Button variant="ghost" size="sm" onClick={() => openTreePicker("url")} className="h-8 w-8 p-0">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <Input
                id="url"
                value={localData.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Headers</Label>
                <Button variant="outline" size="sm" onClick={() => handleArrayAdd("headers")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Header
                </Button>
              </div>
              {(localData.headers || []).map((header: any, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Header name"
                    value={header.key || ""}
                    onChange={(e) => handleArrayItemChange("headers", index, "key", e.target.value)}
                  />
                  <Input
                    placeholder="Header value"
                    value={header.value || ""}
                    onChange={(e) => handleArrayItemChange("headers", index, "value", e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={() => handleArrayRemove("headers", index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Request Body</Label>
                <Button variant="ghost" size="sm" onClick={() => openTreePicker("body")} className="h-8 w-8 p-0">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="body"
                value={localData.body || ""}
                onChange={(e) => handleInputChange("body", e.target.value)}
                placeholder="Request body content..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="authType">Authentication Type</Label>
              <Select
                value={localData.authType || "none"}
                onValueChange={(value) => handleInputChange("authType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {localData.authType === "bearer" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="token">Bearer Token</Label>
                  <Button variant="ghost" size="sm" onClick={() => openTreePicker("token")} className="h-8 w-8 p-0">
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="token"
                  type="password"
                  value={localData.token || ""}
                  onChange={(e) => handleInputChange("token", e.target.value)}
                  placeholder="Bearer token..."
                />
              </div>
            )}
            {localData.authType === "basic" && (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="username">Username</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTreePicker("username")}
                      className="h-8 w-8 p-0"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id="username"
                    value={localData.username || ""}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="Username..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTreePicker("password")}
                      className="h-8 w-8 p-0"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={localData.password || ""}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Password..."
                  />
                </div>
              </>
            )}
            {localData.authType === "apikey" && (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apiKeyName">API Key Name</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTreePicker("apiKeyName")}
                      className="h-8 w-8 p-0"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id="apiKeyName"
                    value={localData.apiKeyName || ""}
                    onChange={(e) => handleInputChange("apiKeyName", e.target.value)}
                    placeholder="e.g., X-API-Key"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apiKeyValue">API Key Value</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTreePicker("apiKeyValue")}
                      className="h-8 w-8 p-0"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id="apiKeyValue"
                    type="password"
                    value={localData.apiKeyValue || ""}
                    onChange={(e) => handleInputChange("apiKeyValue", e.target.value)}
                    placeholder="API key value..."
                  />
                </div>
              </>
            )}
          </div>
        )

      case "interactive_form_http":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Form Fields</Label>
                <Button variant="outline" size="sm" onClick={() => handleArrayAdd("formFields")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>
              {(localData.formFields || []).map((field: any, index: number) => (
                <Card key={index} className="p-3 mb-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Field name"
                      value={field.name || ""}
                      onChange={(e) => handleArrayItemChange("formFields", index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Field label"
                      value={field.label || ""}
                      onChange={(e) => handleArrayItemChange("formFields", index, "label", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Select
                      value={field.type || "text"}
                      onValueChange={(value) => handleArrayItemChange("formFields", index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="password">Password</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Placeholder"
                      value={field.placeholder || ""}
                      onChange={(e) => handleArrayItemChange("formFields", index, "placeholder", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) => handleArrayItemChange("formFields", index, "required", e.target.checked)}
                      />
                      <span>Required</span>
                    </label>
                    <Button variant="outline" size="sm" onClick={() => handleArrayRemove("formFields", index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="httpMethod">HTTP Method</Label>
                <Select
                  value={localData.httpMethod || "POST"}
                  onValueChange={(value) => handleInputChange("httpMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="httpUrl">HTTP URL</Label>
                <Button variant="ghost" size="sm" onClick={() => openTreePicker("httpUrl")} className="h-8 w-8 p-0">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <Input
                id="httpUrl"
                value={localData.httpUrl || ""}
                onChange={(e) => handleInputChange("httpUrl", e.target.value)}
                placeholder="https://api.example.com/submit"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="httpBodyTemplate">Request Body Template</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openTreePicker("httpBodyTemplate")}
                  className="h-8 w-8 p-0"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="httpBodyTemplate"
                value={localData.httpBodyTemplate || ""}
                onChange={(e) => handleInputChange("httpBodyTemplate", e.target.value)}
                placeholder='{"field1": "{{field1}}", "field2": "{{field2}}"}'
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </div>
        )

      case "end":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what this end node represents..."
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe this node..."
              />
            </div>
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Node Configuration</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Node Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{node.type}</Badge>
              <span className="text-sm text-muted-foreground">ID: {node.id}</span>
            </div>
            <div>
              <Label htmlFor="label">Node Label</Label>
              <Input
                id="label"
                value={localData.label || ""}
                onChange={(e) => handleInputChange("label", e.target.value)}
                placeholder="Enter node label..."
              />
            </div>
          </div>

          <Separator />

          {/* Node-specific fields */}
          {renderNodeSpecificFields()}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t">
        <Button variant="destructive" size="sm" onClick={onDelete} className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Node
        </Button>
      </div>

      {/* TreePicker Dialog */}
      <Dialog open={showTreePicker} onOpenChange={setShowTreePicker}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Map Data for {currentMappingField}</DialogTitle>
          </DialogHeader>
          <TreePicker
            previousNodes={mockPreviousNodes}
            currentNodeInputs={mockCurrentNodeInputs}
            initialMappings={{ [currentMappingField]: localData[currentMappingField] || "" }}
            onMappingsChange={handleMappingsChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
