"use client"

import { useState, useEffect } from "react"
import type { Node } from "reactflow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Trash, Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // Reusable HTTP configuration rendering
  const renderHttpConfig = (currentConfig: any, updateFn: (key: string, value: any) => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">HTTP Method</Label>
          <Select value={currentConfig.method || "GET"} onValueChange={(value) => updateFn("method", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (seconds)</Label>
          <Input
            id="timeout"
            type="number"
            value={currentConfig.timeout || 30}
            onChange={(e) => updateFn("timeout", Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          placeholder="https://api.example.com/endpoint"
          value={currentConfig.url || ""}
          onChange={(e) => updateFn("url", e.target.value)}
        />
      </div>

      <Tabs defaultValue="headers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
        </TabsList>

        <TabsContent value="headers" className="space-y-4">
          <div className="space-y-2">
            <Label>Headers</Label>
            {(currentConfig.headers || []).map((header: any, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Header name"
                  value={header.key || ""}
                  onChange={(e) => {
                    const newHeaders = [...(currentConfig.headers || [])]
                    newHeaders[index] = { ...header, key: e.target.value }
                    updateFn("headers", newHeaders)
                  }}
                />
                <Input
                  placeholder="Header value"
                  value={header.value || ""}
                  onChange={(e) => {
                    const newHeaders = [...(currentConfig.headers || [])]
                    newHeaders[index] = { ...header, value: e.target.value }
                    updateFn("headers", newHeaders)
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newHeaders = (currentConfig.headers || []).filter((_: any, i: number) => i !== index)
                    updateFn("headers", newHeaders)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newHeaders = [...(currentConfig.headers || []), { key: "", value: "" }]
                updateFn("headers", newHeaders)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Header
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="body" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select
              value={currentConfig.contentType || "application/json"}
              onValueChange={(value) => updateFn("contentType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application/json">application/json</SelectItem>
                <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                <SelectItem value="text/plain">text/plain</SelectItem>
                <SelectItem value="text/xml">text/xml</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Request Body</Label>
            <Textarea
              id="body"
              rows={6}
              placeholder='{"key": "value"}'
              value={currentConfig.body || ""}
              onChange={(e) => updateFn("body", e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authType">Authentication Type</Label>
            <Select value={currentConfig.authType || "none"} onValueChange={(value) => updateFn("authType", value)}>
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

          {currentConfig.authType === "bearer" && (
            <div className="space-y-2">
              <Label htmlFor="token">Bearer Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter bearer token"
                value={currentConfig.token || ""}
                onChange={(e) => updateFn("token", e.target.value)}
              />
            </div>
          )}

          {currentConfig.authType === "basic" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={currentConfig.username || ""}
                  onChange={(e) => updateFn("username", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={currentConfig.password || ""}
                  onChange={(e) => updateFn("password", e.target.value)}
                />
              </div>
            </div>
          )}

          {currentConfig.authType === "apikey" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKeyName">API Key Name</Label>
                <Input
                  id="apiKeyName"
                  placeholder="X-API-Key"
                  value={currentConfig.apiKeyName || ""}
                  onChange={(e) => updateFn("apiKeyName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeyValue">API Key Value</Label>
                <Input
                  id="apiKeyValue"
                  type="password"
                  value={currentConfig.apiKeyValue || ""}
                  onChange={(e) => updateFn("apiKeyValue", e.target.value)}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )

  // Update the NodeConfigPanel to handle all node types properly and show appropriate configuration forms
  const renderForm = () => {
    switch (node.type) {
      case "start":
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

      case "http_request":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={formData.label || ""} onChange={(e) => handleChange("label", e.target.value)} />
            </div>
            {renderHttpConfig(formData, handleChange)}
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

      case "interactive_form_http":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="label">Node Label</Label>
              <Input
                id="label"
                placeholder="Enter node label"
                value={formData.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
              />
            </div>

            {/* Form Fields Configuration */}
            <div className="space-y-2">
              <Label>Form Fields</Label>
              {(formData.formFields || []).map((field: any, index: number) => (
                <Card key={index} className="p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g., email"
                        value={field.name || ""}
                        onChange={(e) => {
                          const newFields = [...(formData.formFields || [])]
                          newFields[index] = { ...field, name: e.target.value }
                          handleChange("formFields", newFields)
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Label</Label>
                      <Input
                        placeholder="e.g., Email Address"
                        value={field.label || ""}
                        onChange={(e) => {
                          const newFields = [...(formData.formFields || [])]
                          newFields[index] = { ...field, label: e.target.value }
                          handleChange("formFields", newFields)
                        }}
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label>Type</Label>
                      <Select
                        value={field.type || "text"}
                        onValueChange={(value) => {
                          const newFields = [...(formData.formFields || [])]
                          newFields[index] = { ...field, type: value }
                          handleChange("formFields", newFields)
                        }}
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label>Placeholder</Label>
                      <Input
                        placeholder="e.g., enter your email"
                        value={field.placeholder || ""}
                        onChange={(e) => {
                          const newFields = [...(formData.formFields || [])]
                          newFields[index] = { ...field, placeholder: e.target.value }
                          handleChange("formFields", newFields)
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      const newFields = (formData.formFields || []).filter((_: any, i: number) => i !== index)
                      handleChange("formFields", newFields)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove Field
                  </Button>
                </Card>
              ))}
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  const newFields = [
                    ...(formData.formFields || []),
                    { name: "", label: "", type: "text", placeholder: "" },
                  ]
                  handleChange("formFields", newFields)
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Form Field
              </Button>
            </div>

            {/* HTTP Request Configuration */}
            <div className="space-y-2">
              <Label>HTTP Request</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="httpMethod">Method</Label>
                  <Select
                    value={formData.httpMethod || "POST"}
                    onValueChange={(value) => handleChange("httpMethod", value)}
                  >
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
                <div className="space-y-1">
                  <Label htmlFor="httpUrl">URL</Label>
                  <Input
                    id="httpUrl"
                    placeholder="https://api.example.com/submit"
                    value={formData.httpUrl || ""}
                    onChange={(e) => handleChange("httpUrl", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="httpBodyTemplate">Request Body Template (JSON)</Label>
                <Textarea
                  id="httpBodyTemplate"
                  rows={5}
                  placeholder='{"email": "{{email}}", "name": "{{name}}"}'
                  value={formData.httpBodyTemplate || ""}
                  onChange={(e) => handleChange("httpBodyTemplate", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Use `{"{{fieldName}}"}` to inject form values.</p>
              </div>
            </div>

            {/* Error Mapping Configuration */}
            <div className="space-y-2">
              <Label htmlFor="errorMapping">Error Mapping (JSON)</Label>
              <Textarea
                id="errorMapping"
                rows={3}
                placeholder='{"backend_email_error": "email", "backend_name_error": "name"}'
                value={
                  formData.errorMapping
                    ? typeof formData.errorMapping === "string"
                      ? formData.errorMapping
                      : JSON.stringify(formData.errorMapping, null, 2)
                    : ""
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleChange("errorMapping", parsed)
                  } catch {
                    handleChange("errorMapping", e.target.value)
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Map backend error keys to your form field names.</p>
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
