"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DialogFooter } from "@/components/ui/dialog"
import type { PreviousWorkflowNode, CurrentNodeInputField } from "@/types/workflow"
import { NodeOutputTree } from "./node-output-tree"
import  InputMappingSlot  from "./input-mapping-slot"

interface TreePickerProps {
  previousNodes: PreviousWorkflowNode[]
  currentNodeInputs: CurrentNodeInputField[]
  initialMappings: Record<string, string>
  onMappingsChange: (mappings: Record<string, string>) => void
}

export function TreePicker({ previousNodes, currentNodeInputs, initialMappings, onMappingsChange }: TreePickerProps) {
  const [mappings, setMappings] = useState<Record<string, string>>(initialMappings)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null)

  useEffect(() => {
    setMappings(initialMappings)
  }, [initialMappings])

  const handleMappingChange = useCallback((inputName: string, value: string) => {
    setMappings((prev) => ({ ...prev, [inputName]: value }))
  }, [])

  const handleOutputSelect = useCallback((path: string) => {
    setSelectedOutput(path)
  }, [])

  const handleApplyMapping = useCallback(() => {
    if (selectedOutput && currentNodeInputs.length > 0) {
      // Assuming we are mapping to the first input field for simplicity
      // In a more complex scenario, you might have a way to select which input field to map to
      const targetInputName = currentNodeInputs[0].name
      handleMappingChange(targetInputName, selectedOutput)
    }
  }, [selectedOutput, currentNodeInputs, handleMappingChange])

  const filteredNodes = previousNodes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-2 gap-4 h-[calc(80vh-120px)]">
      {/* Left Panel: Previous Node Outputs */}
      <div className="flex flex-col border-r pr-4">
        <h4 className="font-semibold mb-2">Previous Node Outputs</h4>
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="flex-1 pr-2">
          <Accordion type="multiple" className="w-full">
            {filteredNodes.length === 0 && <p className="text-muted-foreground text-sm">No nodes found.</p>}
            {filteredNodes.map((node) => (
              <AccordionItem key={node.id} value={node.id}>
                <AccordionTrigger className="text-base font-medium">
                  {node.label} <span className="text-sm text-muted-foreground ml-2">({node.type})</span>
                </AccordionTrigger>
                <AccordionContent>
                  <NodeOutputTree
                    nodeId={node.id}
                    outputs={node.outputs}
                    onSelect={handleOutputSelect}
                    selectedPath={selectedOutput}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>

      {/* Right Panel: Current Node Inputs & Mapping */}
      <div className="flex flex-col pl-4">
        <h4 className="font-semibold mb-2">Current Node Inputs</h4>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {currentNodeInputs.length === 0 && (
              <p className="text-muted-foreground text-sm">No configurable inputs for this node.</p>
            )}
            {currentNodeInputs.map((inputField) => (
              <InputMappingSlot
                key={inputField.name}
                inputField={inputField}
                currentValue={mappings[inputField.name] || ""}
                onValueChange={(value) => handleMappingChange(inputField.name, value)}
                selectedOutput={selectedOutput}
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button onClick={() => onMappingsChange(mappings)} disabled={Object.keys(mappings).length === 0}>
            Confirm Mapping
          </Button>
        </DialogFooter>
      </div>
    </div>
  )
}
