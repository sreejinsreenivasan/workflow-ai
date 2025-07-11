"use client"

import { useState } from "react"
import type { Node } from "reactflow"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Edit, Trash, Clock, Globe, Mail, Database, FileUp, Webhook } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NodeConfigurationDialog } from "@/components/node-configuration-dialog"

interface NodeDetailsPanelProps {
  node: Node
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete: () => void
}

export function NodeDetailsPanel({ node, isOpen, onClose, onUpdate, onDelete }: NodeDetailsPanelProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Get node icon based on type
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "start":
        return "▶️"
      case "function":
        return "🔧"
      case "condition":
        return "🔀"
      case "end":
        return "⏹️"
      case "http_call":
        return <Globe className="h-4 w-4" />
      case "ai_copilot":
        return "🤖"
      case "form":
        return "📝"
      case "timer":
        return <Clock className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "webhook":
        return <Webhook className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "file_upload":
        return <FileUp className="h-4 w-4" />
      default:
        return "📦"
    }
  }

  // Get node type display name
  const getNodeTypeName = (type: string) => {
    switch (type) {
      case "start":
        return "Start Node"
      case "function":
        return "Function Node"
      case "condition":
        return "Condition Node"
      case "end":
        return "End Node"
      case "http_call":
        return "HTTP Call"
      case "ai_copilot":
        return "AI Copilot"
      case "form":
        return "Form"
      case "timer":
        return "Timer"
      case "email":
        return "Send Email"
      case "webhook":
        return "Webhook"
      case "database":
        return "Database"
      case "file_upload":
        return "File Upload"
      default:
        return "Custom Node"
    }
  }

  // Render node-specific details
  const renderNodeDetails = () => {
    switch (node.type) {
      case "start":
        return (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{node.data.description || "Starting point of the workflow"}</p>
            </div>
          </div>
        )

      case "function":
        return (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{node.data.description || "Execute a function or action"}</p>
            </div>
            {node.data.parameters && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Parameters</h4>
                <Card>
                  <CardContent className="p-3">
                    <pre className="text-xs overflow-auto">
                      {typeof node.data.parameters === "string"
                        ? node.data.parameters
                        : JSON.stringify(node.data.parameters, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )

      case "http_call":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Method</h4>
                <Badge variant="outline">{node.data.method || "GET"}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Timeout</h4>
                <p className="text-sm">{node.data.timeout || 30}s</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">URL</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">{node.data.url || "Not configured"}</p>
            </div>
            {node.data.headers && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Headers</h4>
                <Card>
                  <CardContent className="p-3">
                    <pre className="text-xs overflow-auto">
                      {typeof node.data.headers === "string"
                        ? node.data.headers
                        : JSON.stringify(node.data.headers, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )

      case "ai_copilot":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Model</h4>
                <Badge variant="outline">{node.data.model || "gpt-4o"}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Temperature</h4>
                <p className="text-sm">{node.data.temperature || 0.7}</p>
              </div>
            </div>
            {node.data.prompt && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Prompt Template</h4>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs">{node.data.prompt}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Max Tokens</h4>
              <p className="text-sm">{node.data.maxTokens || 1000}</p>
            </div>
          </div>
        )

      case "condition":
        return (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Condition</h4>
              <Card>
                <CardContent className="p-3">
                  <code className="text-xs">{node.data.condition || "true"}</code>
                </CardContent>
              </Card>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{node.data.description || "Branch based on a condition"}</p>
            </div>
          </div>
        )

      case "timer":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                <p className="text-sm">{node.data.duration || 1}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Unit</h4>
                <Badge variant="outline">{node.data.unit || "minutes"}</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Total Wait Time</h4>
              <p className="text-sm">
                {node.data.duration || 1} {node.data.unit || "minutes"}
              </p>
            </div>
          </div>
        )

      case "email":
        return (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">To</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">{node.data.to || "Not configured"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Subject</h4>
              <p className="text-sm">{node.data.subject || "No subject"}</p>
            </div>
            {node.data.body && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Body Preview</h4>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-xs line-clamp-3">{node.data.body}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )

      case "end":
        return (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{node.data.description || "End point of the workflow"}</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{node.data.description || "Custom node configuration"}</p>
            </div>
            {node.data.parameters && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Configuration</h4>
                <Card>
                  <CardContent className="p-3">
                    <pre className="text-xs overflow-auto">
                      {typeof node.data.parameters === "string"
                        ? node.data.parameters
                        : JSON.stringify(node.data.parameters, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )
    }
  }

  const handleEditConfirm = (config: any) => {
    onUpdate(config)
    setShowEditDialog(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="w-80 border-l bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Node Details</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Node Header */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getNodeIcon(node.type)}</div>
                <div>
                  <h2 className="font-semibold">{node.data.label}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {getNodeTypeName(node.type)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Node ID</h4>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{node.id}</p>
                </div>
              </div>
            </div>

            {/* Node-specific details */}
            <div>
              <h3 className="font-medium mb-3">Configuration</h3>
              {renderNodeDetails()}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-2">
          <Button className="w-full" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Configuration
          </Button>
          <Button variant="destructive" className="w-full" onClick={onDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Node
          </Button>
        </div>
      </div>

      {/* Edit Configuration Dialog */}
      <NodeConfigurationDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        nodeType={node.type}
        nodeLabel={node.data.label}
        initialConfig={node.data}
        onConfirm={handleEditConfirm}
      />
    </>
  )
}
