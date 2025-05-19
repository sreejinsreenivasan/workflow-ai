"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowGraph } from "@/components/workflow-graph"
import { parse } from "yaml"

interface YamlPreviewProps {
  yaml: string
  isOpen: boolean
  onClose: () => void
}

export function YamlPreview({ yaml, isOpen, onClose }: YamlPreviewProps) {
  const [activeTab, setActiveTab] = useState("graph")

  // Parse YAML to JSON
  let parsedYaml = {}
  try {
    parsedYaml = parse(yaml)
  } catch (error) {
    console.error("Failed to parse YAML:", error)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Workflow Preview</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="json">JSON View</TabsTrigger>
          </TabsList>
          <TabsContent value="graph" className="flex-1 overflow-auto p-4 border rounded-md mt-2">
            <WorkflowGraph workflow={parsedYaml} />
          </TabsContent>
          <TabsContent value="json" className="flex-1 overflow-auto p-4 border rounded-md mt-2">
            <pre className="text-sm font-mono whitespace-pre-wrap">{JSON.stringify(parsedYaml, null, 2)}</pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
