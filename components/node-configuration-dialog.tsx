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
  const [config, setConfig] = useState<any>({ label: nodeLabel, ...initialConfig })
  const [formData, setFormData] = useState<any>({ label: nodeLabel, ...initialConfig })
  const node = { type: nodeType }

  // Initialize config when dialog opens or initialConfig changes
  useEffect(() => {
    if (isOpen) {
      setConfig({
        label: nodeLabel,
        ...initialConfig,
      })
      setFormData({
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
    setFormData({})
    onClose()
  }

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }))
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

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

  const renderConditionConfig = () => (
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
        <Label htmlFor="condition">Condition</Label>
        <Textarea
          id="condition"
          rows={3}
          placeholder="data.status === 'approved'"
          value={config.condition || ""}
          onChange={(e) => updateConfig("condition", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Enter a JavaScript expression that evaluates to true or false.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={2}
          placeholder="Describe the condition..."
          value={config.description || ""}
          onChange={(e) => updateConfig("description", e.target.value)}
        />
      </div>
    </div>
  )

  const renderInteractiveFormHttpConfig = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          placeholder="Enter node label"
          value={config.label || ""}
          onChange={(e) => updateConfig("label", e.target.value)}
        />
      </div>

      {/* Form Fields Configuration */}
      <div className="space-y-2">
        <Label>Form Fields</Label>
        {(config.formFields || []).map((field: any, index: number) => (
          <Card key={index} className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., email"
                  value={field.name || ""}
                  onChange={(e) => {
                    const newFields = [...(config.formFields || [])]
                    newFields[index] = { ...field, name: e.target.value }
                    updateConfig("formFields", newFields)
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label>Label</Label>
                <Input
                  placeholder="e.g., Email Address"
                  value={field.label || ""}
                  onChange={(e) => {
                    const newFields = [...(config.formFields || [])]
                    newFields[index] = { ...field, label: e.target.value }
                    updateConfig("formFields", newFields)
                  }}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Type</Label>
                <Select
                  value={field.type || "text"}
                  onValueChange={(value) => {
                    const newFields = [...(config.formFields || [])]
                    newFields[index] = { ...field, type: value }
                    updateConfig("formFields", newFields)
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
                    const newFields = [...(config.formFields || [])]
                    newFields[index] = { ...field, placeholder: e.target.value }
                    updateConfig("formFields", newFields)
                  }}
                />
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                const newFields = (config.formFields || []).filter((_: any, i: number) => i !== index)
                updateConfig("formFields", newFields)
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
            const newFields = [...(config.formFields || []), { name: "", label: "", type: "text", placeholder: "" }]
            updateConfig("formFields", newFields)
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
            <Select value={config.httpMethod || "POST"} onValueChange={(value) => updateConfig("httpMethod", value)}>
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
              value={config.httpUrl || ""}
              onChange={(e) => updateConfig("httpUrl", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="httpBodyTemplate">Request Body Template (JSON)</Label>
          <Textarea
            id="httpBodyTemplate"
            rows={5}
            placeholder='{"email": "{{email}}", "name": "{{name}}"}'
            value={config.httpBodyTemplate || ""}
            onChange={(e) => updateConfig("httpBodyTemplate", e.target.value)}
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
            config.errorMapping
              ? typeof config.errorMapping === "string"
                ? config.errorMapping
                : JSON.stringify(config.errorMapping, null, 2)
              : ""
          }
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              updateConfig("errorMapping", parsed)
            } catch {
              updateConfig("errorMapping", e.target.value)
            }
          }}
        />
        <p className="text-xs text-muted-foreground">Map backend error keys to your form field names.</p>
      </div>
    </div>
  )

  const renderConfiguration = () => {
    switch (node.type) {
      case "http_request":
        return renderHttpConfig(config, updateConfig)
      case "ai_copilot":
        return renderAiCopilotConfig()
      case "form":
        return renderFormConfig()
      case "timer":
        return renderTimerConfig()
      case "interactive_form_http":
        return renderInteractiveFormHttpConfig()
      case "condition": // Added case for condition node
        return renderConditionConfig()
      default:
        return renderBasicConfig()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{nodeLabel}</DialogTitle>
        </DialogHeader>
        {renderConfiguration()}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
