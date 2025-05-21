"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Download, Eye, Save, Maximize, Minimize, Settings, RotateCcw } from "lucide-react"
import Link from "next/link"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { YamlPreview } from "@/components/yaml-preview"
import { EditorSettingsDialog } from "@/components/editor-settings-dialog"

// Sample YAML content
const sampleYaml = `name: Customer Onboarding
description: Process for onboarding new customers into the system
version: 1.0
triggers:
  - type: webhook
    config:
      url: /api/triggers/customer-onboarding
  - type: schedule
    config:
      cron: "0 9 * * 1-5"
steps:
  - id: step1
    name: Initialize
    type: start
    next: step2
  - id: step2
    name: Process Customer Data
    type: function
    parameters:
      input: data
      transformation: normalize
    next: step3
  - id: step3
    name: Validate Customer Information
    type: condition
    condition: data.valid === true
    onTrue: step4
    onFalse: step5
  - id: step4
    name: Success Path
    type: function
    parameters:
      action: complete
    next: null
  - id: step5
    name: Error Path
    type: function
    parameters:
      action: retry
    next: step2
`

// YAML schema for validation
const yamlSchema = {
  type: "object",
  required: ["name", "steps"],
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    version: { type: "string" },
    triggers: {
      type: "array",
      items: {
        type: "object",
        required: ["type", "config"],
        properties: {
          type: { type: "string", enum: ["webhook", "schedule", "event"] },
          config: { type: "object" },
        },
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "type"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string", enum: ["start", "function", "condition", "end"] },
          next: { type: ["string", "null"] },
          parameters: { type: "object" },
          condition: { type: "string" },
          onTrue: { type: ["string", "null"] },
          onFalse: { type: ["string", "null"] },
        },
      },
    },
  },
}

export default function YamlEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [yaml, setYaml] = useState(sampleYaml)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: "off" as "off" | "on",
    minimap: true,
    lineNumbers: true,
  })
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  // Get workflow ID from query params
  const workflowId = searchParams.get("id")

  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Configure YAML language features
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "http://myserver/workflow-schema.json",
          fileMatch: ["*"],
          schema: yamlSchema,
        },
      ],
    })

    // Set editor options
    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      wordWrap: editorSettings.wordWrap,
      minimap: { enabled: editorSettings.minimap },
      lineNumbers: editorSettings.lineNumbers ? "on" : "off",
      folding: true,
      foldingStrategy: "indentation",
      scrollBeyondLastLine: false,
      automaticLayout: true,
    })
  }

  // Handle save
  const handleSave = () => {
    // Here you would save the YAML to your backend
    toast({
      title: "YAML saved",
      description: "Your workflow definition has been saved successfully.",
    })
  }

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([yaml], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `workflow-${workflowId || "new"}.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle settings change
  const handleSettingsChange = (newSettings: typeof editorSettings) => {
    setEditorSettings(newSettings)
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: newSettings.fontSize,
        tabSize: newSettings.tabSize,
        wordWrap: newSettings.wordWrap,
        minimap: { enabled: newSettings.minimap },
        lineNumbers: newSettings.lineNumbers ? "on" : "off",
      })
    }
  }

  // Toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  // Effect to handle escape key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullScreen])

  return (
    <div className={`flex flex-col ${isFullScreen ? "fixed inset-0 z-50 bg-background" : "h-screen"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${isFullScreen ? "border-b" : ""}`}>
        {!isFullScreen && (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={workflowId ? `/workflow/${workflowId}` : "/library"}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-xl font-bold">YAML Editor</h1>
          </div>
        )}

        <div className="flex items-center space-x-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span className="sr-only">{isFullScreen ? "Exit Full Screen" : "Full Screen"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setYaml(sampleYaml)}>
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset</span>
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1" style={{ height: "calc(100vh - 12rem)" }}>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="yaml"
          value={yaml}
          onChange={(value) => setYaml(value || "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: true },
          }}
        />
      </div>

      {/* Preview Modal */}
      <YamlPreview yaml={yaml} isOpen={showPreview} onClose={() => setShowPreview(false)} />

      {/* Settings Dialog */}
      <EditorSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={editorSettings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}
