"use client"

import type * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Hash, CheckSquare, Box, List } from "lucide-react"
import type { WorkflowNodeOutputField } from "@/types/workflow"

interface NodeOutputTreeProps {
  nodeId: string
  outputs: WorkflowNodeOutputField[]
  onSelectField: (nodeId: string, fieldPath: string) => void
  searchQuery: string
  parentPath?: string
  level?: number
}

const MAX_DEPTH = 3 // Limit nested levels for display

const NodeOutputTree: React.FC<NodeOutputTreeProps> = ({
  nodeId,
  outputs,
  onSelectField,
  searchQuery,
  parentPath = "",
  level = 0,
}) => {
  const renderIcon = (type: string) => {
    switch (type) {
      case "string":
        return <FileText className="h-3 w-3 text-blue-500" />
      case "number":
        return <Hash className="h-3 w-3 text-green-500" />
      case "boolean":
        return <CheckSquare className="h-3 w-3 text-purple-500" />
      case "object":
        return <Box className="h-3 w-3 text-orange-500" />
      case "array":
        return <List className="h-3 w-3 text-red-500" />
      default:
        return <FileText className="h-3 w-3 text-gray-500" />
    }
  }

  const filterAndRenderFields = (fields: WorkflowNodeOutputField[], currentPath: string, currentLevel: number) => {
    return fields
      .filter((field) => {
        const lowerCaseQuery = searchQuery.toLowerCase()
        const matchesSelf =
          field.key.toLowerCase().includes(lowerCaseQuery) ||
          field.label.toLowerCase().includes(lowerCaseQuery) ||
          (field.description && field.description.toLowerCase().includes(lowerCaseQuery)) ||
          field.type.toLowerCase().includes(lowerCaseQuery)

        if (matchesSelf) return true

        // If it's an object/array, check children recursively
        if (field.children && field.children.length > 0 && currentLevel < MAX_DEPTH) {
          return filterAndRenderFields(field.children, `${currentPath}.${field.key}`, currentLevel + 1).length > 0
        }
        return false
      })
      .map((field) => {
        const fieldPath = currentPath ? `${currentPath}.${field.key}` : field.key
        const isExpandable = field.children && field.children.length > 0 && currentLevel < MAX_DEPTH

        if (isExpandable) {
          return (
            <AccordionItem key={fieldPath} value={fieldPath} className="border-none">
              <AccordionTrigger className="py-1 px-2 hover:bg-muted/50 data-[state=open]:bg-muted/50 rounded-md">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {renderIcon(field.type)}
                  <span>{field.label}</span>
                  <span className="text-muted-foreground text-xs font-normal">({field.key})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4">
                <Accordion type="multiple" className="w-full">
                  {filterAndRenderFields(field.children!, fieldPath, currentLevel + 1)}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          )
        } else {
          // Leaf node or max depth reached
          return (
            <TooltipProvider key={fieldPath}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto py-1 px-2 text-sm font-normal"
                    onClick={() => onSelectField(nodeId, fieldPath)}
                  >
                    <div className="flex items-center gap-2">
                      {renderIcon(field.type)}
                      <span>{field.label}</span>
                      <span className="text-muted-foreground text-xs font-normal">({field.key})</span>
                    </div>
                  </Button>
                </TooltipTrigger>
                {field.description && <TooltipContent>{field.description}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          )
        }
      })
  }

  return (
    <Accordion type="multiple" className="w-full">
      {filterAndRenderFields(outputs, parentPath, level)}
    </Accordion>
  )
}

export default NodeOutputTree
