"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { XCircle, LinkIcon } from "lucide-react"
import type { CurrentNodeInputField } from "@/types/workflow"

interface InputMappingSlotProps {
  field: CurrentNodeInputField
  currentMapping: string
  onSelect: (fieldName: string) => void
  onClear: (fieldName: string) => void
  onExpressionChange: (fieldName: string, value: string) => void
  isActive: boolean
}

const InputMappingSlot: React.FC<InputMappingSlotProps> = ({
  field,
  currentMapping,
  onSelect,
  onClear,
  onExpressionChange,
  isActive,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  return (
    <div
      className={`border rounded-md p-3 transition-all duration-200 ${
        isActive ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
      }`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor={`input-${field.name}`} className="text-sm font-medium flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
              <span className="text-muted-foreground text-xs font-normal">({field.name})</span>
            </Label>
          </TooltipTrigger>
          {field.description && <TooltipContent>{field.description}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center gap-2 mt-2">
        <Input
          ref={inputRef}
          id={`input-${field.name}`}
          value={currentMapping}
          onChange={(e) => onExpressionChange(field.name, e.target.value)}
          placeholder={`Enter value or map data for ${field.label}`}
          className="flex-1"
        />
        {currentMapping && (
          <Button variant="ghost" size="icon" onClick={() => onClear(field.name)}>
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="sr-only">Clear mapping</span>
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={() => onSelect(field.name)}>
          <LinkIcon className="h-4 w-4" />
          <span className="sr-only">Map data</span>
        </Button>
      </div>
    </div>
  )
}

export default InputMappingSlot
