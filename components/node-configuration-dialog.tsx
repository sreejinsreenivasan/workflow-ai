"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"

interface NodeConfigurationDialogProps {
  isOpen: boolean
  onClose: () => void
  nodeType: string
  nodeLabel: string
  initialConfig?: any
  onConfirm: (config: any) => void
}

export function NodeConfigurationDialog({
  isOpen,
  onClose,
  nodeType,
  nodeLabel,
  initialConfig = {},
  onConfirm,
}: NodeConfigurationDialogProps) {
  const [config, setConfig] = useState<any>({})

  // Initialize config when dialog opens or initialConfig changes
  useEffect(() => {
    if (isOpen) {
      setConfig({
        label: nodeLabel,
        ...initialConfig,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm(config)
    onClose()
  }

  const handleCancel = () => {
    setConfig({})
    onClose()
  }

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }))
  }

  const renderHttpCallConfig = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">HTTP Method</Label>
          <Select value={config.method || "GET"} onValueChange={(value) => updateConfig("method", value)}>
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
            value={config.timeout || 30}
            onChange={(e) => updateConfig("timeout", Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          placeholder="https://api.example.com/endpoint"
          value={config.url || ""}
          onChange={(e) => updateConfig("url", e.target.value)}
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
            {(config.headers || []).map((header: any, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Header name"
                  value={header.key || ""}
                  onChange={(e) => {
                    const newHeaders = [...(config.headers || [])]
                    newHeaders[index] = { ...header, key: e.target.value }
                    updateConfig("headers", newHeaders)
                  }}
                />
                <Input
                  placeholder="Header value"
                  value={header.value || ""}
                  onChange={(e) => {
                    const newHeaders = [...(config.headers || [])]
                    newHeaders[index] = { ...header, value: e.target.value }
                    updateConfig("headers", newHeaders)
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newHeaders = (config.headers || []).filter((_: any, i: number) => i !== index)
                    updateConfig("headers", newHeaders)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newHeaders = [...(config.headers || []), { key: "", value: "" }]
                updateConfig("headers", newHeaders)
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
              value={config.contentType || "application/json"}
              onValueChange={(value) => updateConfig("contentType", value)}
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
              value={config.body || ""}
              onChange={(e) => updateConfig("body", e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="authType">Authentication Type</Label>
            <Select value={config.authType || "none"} onValueChange={(value) => updateConfig("authType", value)}>
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

          {config.authType === "bearer" && (
            <div className="space-y-2">
              <Label htmlFor="token">Bearer Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter bearer token"
                value={config.token || ""}
                onChange={(e) => updateConfig("token", e.target.value)}
              />
            </div>
          )}

          {config.authType === "basic" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={config.username || ""}
                  onChange={(e) => updateConfig("username", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={config.password || ""}
                  onChange={(e) => updateConfig("password", e.target.value)}
                />
              </div>
            </div>
          )}

          {config.authType === "apikey" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKeyName">API Key Name</Label>
                <Input
                  id="apiKeyName"
                  placeholder="X-API-Key"
                  value={config.apiKeyName || ""}
                  onChange={(e) => updateConfig("apiKeyName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKeyValue">API Key Value</Label>
                <Input
                  id="apiKeyValue"
                  type="password"
                  value={config.apiKeyValue || ""}
                  onChange={(e) => updateConfig("apiKeyValue", e.target.value)}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderAiCopilotConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="aiModel">AI Model</Label>
        <Select value={config.aiModel || "gpt-4o"} onValueChange={(value) => updateConfig("aiModel", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          rows={4}
          placeholder="You are a helpful assistant that..."
          value={config.systemPrompt || ""}
          onChange={(e) => updateConfig("systemPrompt", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userPrompt">User Prompt Template</Label>
        <Textarea
          id="userPrompt"
          rows={4}
          placeholder="Process the following data: {{input}}"
          value={config.userPrompt || ""}
          onChange={(e) => updateConfig("userPrompt", e.target.value)}
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
            value={config.temperature || 0.7}
            onChange={(e) => updateConfig("temperature", Number.parseFloat(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            value={config.maxTokens || 1000}
            onChange={(e) => updateConfig("maxTokens", Number.parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  )

  const renderFormConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="formTitle">Form Title</Label>
        <Input
          id="formTitle"
          placeholder="Customer Information"
          value={config.formTitle || ""}
          onChange={(e) => updateConfig("formTitle", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="formDescription">Form Description</Label>
        <Textarea
          id="formDescription"
          rows={2}
          placeholder="Please fill out the required information"
          value={config.formDescription || ""}
          onChange={(e) => updateConfig("formDescription", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Form Fields</Label>
        {(config.fields || []).map((field: any, index: number) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Name</Label>
                  <Input
                    placeholder="email"
                    value={field.name || ""}
                    onChange={(e) => {
                      const newFields = [...(config.fields || [])]
                      newFields[index] = { ...field, name: e.target.value }
                      updateConfig("fields", newFields)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={field.type || "text"}
                    onValueChange={(value) => {
                      const newFields = [...(config.fields || [])]
                      newFields[index] = { ...field, type: value }
                      updateConfig("fields", newFields)
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
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    placeholder="Email Address"
                    value={field.label || ""}
                    onChange={(e) => {
                      const newFields = [...(config.fields || [])]
                      newFields[index] = { ...field, label: e.target.value }
                      updateConfig("fields", newFields)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  <Input
                    placeholder="Enter your email"
                    value={field.placeholder || ""}
                    onChange={(e) => {
                      const newFields = [...(config.fields || [])]
                      newFields[index] = { ...field, placeholder: e.target.value }
                      updateConfig("fields", newFields)
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required || false}
                    onCheckedChange={(checked) => {
                      const newFields = [...(config.fields || [])]
                      newFields[index] = { ...field, required: checked }
                      updateConfig("fields", newFields)
                    }}
                  />
                  <Label>Required</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFields = (config.fields || []).filter((_: any, i: number) => i !== index)
                    updateConfig("fields", newFields)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const newFields = [
              ...(config.fields || []),
              { name: "", type: "text", label: "", placeholder: "", required: false },
            ]
            updateConfig("fields", newFields)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>
    </div>
  )

  const renderTimerConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="durationType">Duration Type</Label>
        <Select value={config.durationType || "fixed"} onValueChange={(value) => updateConfig("durationType", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed Duration</SelectItem>
            <SelectItem value="dynamic">Dynamic (from variable)</SelectItem>
            <SelectItem value="until">Wait Until Specific Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.durationType === "fixed" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              type="number"
              value={config.duration || 1}
              onChange={(e) => updateConfig("duration", Number.parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={config.unit || "minutes"} onValueChange={(value) => updateConfig("unit", value)}>
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
      )}

      {config.durationType === "dynamic" && (
        <div className="space-y-2">
          <Label htmlFor="variableName">Variable Name</Label>
          <Input
            id="variableName"
            placeholder="waitTime"
            value={config.variableName || ""}
            onChange={(e) => updateConfig("variableName", e.target.value)}
          />
        </div>
      )}

      {config.durationType === "until" && (
        <div className="space-y-2">
          <Label htmlFor="targetTime">Target Time (ISO 8601)</Label>
          <Input
            id="targetTime"
            placeholder="2024-01-01T12:00:00Z"
            value={config.targetTime || ""}
            onChange={(e) => updateConfig("targetTime", e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          checked={config.allowCancel || false}
          onCheckedChange={(checked) => updateConfig("allowCancel", checked)}
        />
        <Label>Allow Manual Cancel</Label>
      </div>
    </div>
  )

  const renderBasicConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          placeholder={nodeLabel}
          value={config.label || nodeLabel}
          onChange={(e) => updateConfig("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Describe what this node does..."
          value={config.description || ""}
          onChange={(e) => updateConfig("description", e.target.value)}
        />
      </div>
    </div>
  )

  const renderConfiguration = () => {
    switch (nodeType) {
      case "http_call":
        return renderHttpCallConfig()
      case "ai_copilot":
        return renderAiCopilotConfig()
      case "form":
        return renderFormConfig()
      case "timer":
        return renderTimerConfig()
      default:
        return renderBasicConfig()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {nodeLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{nodeType}</Badge>
            <span className="text-sm text-muted-foreground">Configure the properties for this node</span>
          </div>

          {renderConfiguration()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
