"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface VisualJsonEditorProps {
  value: string
  onChange: (value: string) => void
}

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

export function VisualJsonEditor({ value, onChange }: VisualJsonEditorProps) {
  const [parsedJson, setParsedJson] = useState<JsonValue>({})
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const parsed = JSON.parse(value)
      setParsedJson(parsed)

      // Auto-expand first level
      const newExpandedPaths = new Set<string>()
      if (typeof parsed === "object" && parsed !== null) {
        newExpandedPaths.add("")
      }
      setExpandedPaths(newExpandedPaths)
    } catch (error) {
      console.error("Invalid JSON:", error)
    }
  }, [value])

  const updateJson = (path: string[], newValue: JsonValue) => {
    const result = { ...JSON.parse(value) }
    let current = result

    // Navigate to the parent of the target property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }

    // Update the target property
    if (path.length > 0) {
      current[path[path.length - 1]] = newValue
    } else {
      // Updating the root
      return onChange(JSON.stringify(newValue, null, 2))
    }

    onChange(JSON.stringify(result, null, 2))
  }

  const toggleExpand = (path: string) => {
    const newExpandedPaths = new Set(expandedPaths)
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path)
    } else {
      newExpandedPaths.add(path)
    }
    setExpandedPaths(newExpandedPaths)
  }

  const renderValue = (value: JsonValue, path: string[] = [], key?: string) => {
    const currentPath = key !== undefined ? [...path, key] : path
    const pathString = currentPath.join(".")

    if (value === null) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">null</span>
        </div>
      )
    }

    if (typeof value === "boolean") {
      return (
        <div className="flex items-center space-x-2">
          <select
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={value.toString()}
            onChange={(e) => updateJson(currentPath, e.target.value === "true")}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div>
      )
    }

    if (typeof value === "number") {
      return (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => updateJson(currentPath, Number(e.target.value))}
            className="h-8"
          />
        </div>
      )
    }

    if (typeof value === "string") {
      return (
        <div className="flex items-center space-x-2">
          <Input type="text" value={value} onChange={(e) => updateJson(currentPath, e.target.value)} className="h-8" />
        </div>
      )
    }

    if (Array.isArray(value)) {
      const isExpanded = expandedPaths.has(pathString)

      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => toggleExpand(pathString)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="text-sm font-medium">Array [{value.length}]</span>
          </div>

          {isExpanded && (
            <div className="pl-6 space-y-2 border-l border-border">
              {value.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs font-medium">{index}:</Label>
                    {renderValue(item, currentPath, index.toString())}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const newArray = [...value]
                        newArray.splice(index, 1)
                        updateJson(currentPath, newArray)
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  const newArray = [...value, ""]
                  updateJson(currentPath, newArray)
                }}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Item
              </Button>
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object" && value !== null) {
      const isExpanded = expandedPaths.has(pathString)
      const entries = Object.entries(value)

      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => toggleExpand(pathString)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="text-sm font-medium">Object {`{${entries.length}}`}</span>
          </div>

          {isExpanded && (
            <div className="pl-6 space-y-2 border-l border-border">
              {entries.map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 flex items-center space-x-2">
                      <Label className="text-xs font-medium min-w-20">{k}:</Label>
                      {renderValue(v, currentPath, k)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const newObj = { ...value }
                        delete newObj[k]
                        updateJson(currentPath, newObj)
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center space-x-2 mt-2">
                <Input
                  placeholder="New key"
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      const newObj = { ...value, [e.currentTarget.value]: "" }
                      updateJson(currentPath, newObj)
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling as HTMLInputElement
                    if (input.value) {
                      const newObj = { ...value, [input.value]: "" }
                      updateJson(currentPath, newObj)
                      input.value = ""
                    }
                  }}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return <div className="rounded-md border border-input bg-background p-4">{renderValue(parsedJson)}</div>
}
