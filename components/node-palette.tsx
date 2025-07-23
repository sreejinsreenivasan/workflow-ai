"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react"
import { NodeConfigurationDialog } from "@/components/node-configuration-dialog"

// Node types with their metadata
const nodeCategories = [
  {
    name: "Basic",
    nodes: [
      { type: "start", label: "Start", icon: "▶️", description: "Starting point of the workflow" },
      { type: "function", label: "Function", icon: "🔧", description: "Execute a function or action" },
      { type: "condition", label: "Condition", icon: "🔀", description: "Branch based on a condition" },
      { type: "end", label: "End", icon: "⏹️", description: "End point of the workflow" },
    ],
  },
  {
    name: "Advanced",
    nodes: [
      {
        type: "http_request",
        label: "HTTP Request",
        icon: "🌐",
        description: "Make an HTTP request to an external API",
      },
      { type: "ai_copilot", label: "AI Copilot", icon: "🤖", description: "Use AI to process data" },
      { type: "form", label: "Form", icon: "📝", description: "Display a form to collect user input" },
      { type: "timer", label: "Timer", icon: "⏱️", description: "Wait for a specified duration" },
      { type: "email", label: "Send Email", icon: "📧", description: "Send email notifications" },
      { type: "webhook", label: "Webhook", icon: "🔗", description: "Send webhook notifications" },
      { type: "database", label: "Database", icon: "🗄️", description: "Database operations" },
      { type: "file_upload", label: "File Upload", icon: "📁", description: "Handle file uploads" },
    ],
  },
  {
    name: "My Components",
    nodes: [
      {
        type: "custom_subgraph",
        label: "Customer Validation",
        icon: "📋",
        description: "Validate customer information",
      },
      { type: "custom_subgraph", label: "Payment Processing", icon: "💳", description: "Process payment information" },
      { type: "custom_subgraph", label: "Document Verification", icon: "📄", description: "Verify uploaded documents" },
      { type: "custom_subgraph", label: "Risk Assessment", icon: "⚠️", description: "Assess customer risk" },
    ],
  },
]

interface NodePaletteProps {
  isOpen: boolean
  onToggle: () => void
  onAddNode?: (nodeType: string, nodeLabel: string, config: any, position: { x: number; y: number }) => void
}

export function NodePalette({ isOpen, onToggle, onAddNode }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("Basic")
  const [configDialog, setConfigDialog] = useState<{
    isOpen: boolean
    nodeType: string
    nodeLabel: string
  }>({
    isOpen: false,
    nodeType: "",
    nodeLabel: "",
  })

  // Filter nodes based on search query
  const filteredCategories = nodeCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.nodes.length > 0)

  // Handle drag start
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType)
    event.dataTransfer.setData("application/reactflow/label", nodeLabel)
    event.dataTransfer.effectAllowed = "move"
  }

  // Handle node click to open configuration
  const handleNodeClick = (nodeType: string, nodeLabel: string) => {
    setConfigDialog({
      isOpen: true,
      nodeType,
      nodeLabel,
    })
  }

  // Handle configuration confirmation
  const handleConfigConfirm = (config: any) => {
    if (onAddNode) {
      // Add node at a default position (center of canvas)
      onAddNode(configDialog.nodeType, configDialog.nodeLabel, config, { x: 250, y: 250 })
    }
    setConfigDialog({ isOpen: false, nodeType: "", nodeLabel: "" })
  }

  return (
    <>
      <div className={`border-r bg-background transition-all duration-300 ${isOpen ? "w-64" : "w-10"} flex flex-col`}>
        <div className="flex items-center justify-between p-2 border-b">
          {isOpen && <h3 className="font-medium">Node Palette</h3>}
          <Button variant="ghost" size="icon" onClick={onToggle} className={isOpen ? "" : "mx-auto"}>
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {isOpen && (
          <>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-2 py-1">
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="Basic" className="text-xs px-2 data-[state=active]:bg-background">
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="Advanced" className="text-xs px-2 data-[state=active]:bg-background">
                    Advanced
                  </TabsTrigger>
                  <TabsTrigger value="My Components" className="text-xs px-1 data-[state=active]:bg-background">
                    My Components
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                {searchQuery
                  ? filteredCategories.map((category) => (
                      <div key={category.name} className="p-2">
                        <h4 className="text-sm font-medium mb-2">{category.name}</h4>
                        <div className="space-y-2">
                          {category.nodes.map((node) => (
                            <div
                              key={`${category.name}-${node.label}`}
                              className="flex items-center p-2 rounded-md border cursor-pointer hover:bg-accent transition-colors"
                              draggable
                              onDragStart={(event) => onDragStart(event, node.type, node.label)}
                              onClick={() => handleNodeClick(node.type, node.label)}
                            >
                              <span className="mr-2">{node.icon}</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{node.label}</p>
                                <p className="text-xs text-muted-foreground">{node.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  : nodeCategories
                      .filter((category) => category.name === activeTab)
                      .map((category) => (
                        <div key={category.name} className="p-2">
                          <div className="space-y-2">
                            {category.nodes.map((node) => (
                              <div
                                key={`${category.name}-${node.label}`}
                                className="flex items-center p-2 rounded-md border cursor-pointer hover:bg-accent transition-colors"
                                draggable
                                onDragStart={(event) => onDragStart(event, node.type, node.label)}
                                onClick={() => handleNodeClick(node.type, node.label)}
                              >
                                <span className="mr-2">{node.icon}</span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{node.label}</p>
                                  <p className="text-xs text-muted-foreground">{node.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
              </ScrollArea>
            </Tabs>

            <div className="p-2 border-t">
              <Button variant="outline" className="w-full bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Node
              </Button>
            </div>
          </>
        )}
      </div>

      <NodeConfigurationDialog
        isOpen={configDialog.isOpen}
        onClose={() => setConfigDialog({ isOpen: false, nodeType: "", nodeLabel: "" })}
        nodeType={configDialog.nodeType}
        nodeLabel={configDialog.nodeLabel}
        onConfirm={handleConfigConfirm}
      />
    </>
  )
}
