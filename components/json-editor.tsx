"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Eye } from "lucide-react"
import { VisualJsonEditor } from "@/components/visual-json-editor"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  const [mode, setMode] = useState<"visual" | "raw">("visual")
  const [rawValue, setRawValue] = useState(value)

  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawValue(e.target.value)
    try {
      // Validate JSON
      JSON.parse(e.target.value)
      onChange(e.target.value)
    } catch (error) {
      // Don't update parent if invalid JSON
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "visual" | "raw")} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="visual">
              <Eye className="mr-2 h-4 w-4" />
              Visual Editor
            </TabsTrigger>
            <TabsTrigger value="raw">
              <Code className="mr-2 h-4 w-4" />
              Raw JSON
            </TabsTrigger>
          </TabsList>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  const formatted = JSON.stringify(JSON.parse(value), null, 2)
                  setRawValue(formatted)
                  onChange(formatted)
                } catch (error) {
                  // Handle error
                }
              }}
            >
              Format
            </Button>
          </div>
        </div>

        <TabsContent value="visual" className="mt-4">
          <VisualJsonEditor value={value} onChange={onChange} />
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <div className="relative">
            <textarea
              className="min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={rawValue}
              onChange={handleRawChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
