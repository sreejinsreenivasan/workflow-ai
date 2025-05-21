"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Download, Eye, Save, Maximize, Minimize, Settings, RotateCcw, AlertCircle } from "lucide-react"
import Link from "next/link"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { YamlPreview } from "@/components/yaml-preview"
import { EditorSettingsDialog } from "@/components/editor-settings-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { parse, stringify } from "yaml"
import { validateWorkflowYaml } from "@/lib/yaml-validator"

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

export default function YamlEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [yaml, setYaml] = useState(sampleYaml)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: "off" as "off" | "on",
    minimap: true,
    lineNumbers: true,
  })
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const decorationsRef = useRef<string[]>([])

  // Get workflow ID from query params
  const workflowId = searchParams.get("id")

  // Validate YAML and update editor decorations
  const validateYaml = (yamlContent: string) => {
    try {
      // First, try to parse the YAML to catch syntax errors
      const parsedYaml = parse(yamlContent)

      // Then validate against our workflow schema
      const validationResult = validateWorkflowYaml(parsedYaml)

      setValidationErrors(validationResult.errors)

      // Update editor decorations if editor is mounted
      if (editorRef.current && monacoRef.current) {
        const monaco = monacoRef.current
        const editor = editorRef.current

        // Clear previous decorations
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])

        // Add new decorations for errors
        if (validationResult.errors.length > 0) {
          const decorations = validationResult.errorLocations.map((location) => ({
            range: new monaco.Range(
              location.startLineNumber,
              location.startColumn,
              location.endLineNumber,
              location.endColumn,
            ),
            options: {
              inlineClassName: "errorDecoration",
              hoverMessage: { value: location.message },
              className: "errorLineDecoration",
              glyphMarginClassName: "errorGlyphMargin",
              glyphMarginHoverMessage: { value: location.message },
              overviewRuler: {
                color: "red",
                position: monaco.editor.OverviewRulerLane.Right,
              },
            },
          }))

          decorationsRef.current = editor.deltaDecorations([], decorations)
        }
      }

      return validationResult.isValid
    } catch (error) {
      // Handle YAML syntax errors
      const errorMessage = error instanceof Error ? error.message : "Invalid YAML syntax"
      setValidationErrors([errorMessage])

      // Add error decoration at the top of the file
      if (editorRef.current && monacoRef.current) {
        const monaco = monacoRef.current
        const editor = editorRef.current

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
          {
            range: new monaco.Range(1, 1, 1, 1),
            options: {
              isWholeLine: true,
              className: "errorLineDecoration",
              glyphMarginClassName: "errorGlyphMargin",
              glyphMarginHoverMessage: { value: errorMessage },
              overviewRuler: {
                color: "red",
                position: monaco.editor.OverviewRulerLane.Right,
              },
            },
          },
        ])
      }

      return false
    }
  }

  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Add CSS for error decorations
    monaco.editor.defineTheme("workflowEditorTheme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {},
    })

    monaco.editor.setTheme("workflowEditorTheme")

    // Add CSS for error decorations
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      .errorDecoration {
        text-decoration: wavy underline red;
        text-decoration-skip-ink: none;
      }
      .errorLineDecoration {
        background-color: rgba(255, 0, 0, 0.05);
      }
      .errorGlyphMargin {
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='7' fill='%23e51400'/%3E%3Cpath d='M8 4a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z' fill='white'/%3E%3C/svg%3E") center center no-repeat;
        background-size: 16px;
      }
    `
    document.head.appendChild(styleElement)

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
      glyphMargin: true, // Enable glyph margin for error icons
    })

    // Initial validation
    validateYaml(yaml)

    // Set up change event for validation
    editor.onDidChangeModelContent(
      debounce(() => {
        validateYaml(editor.getValue())
      }, 500),
    )
  }

  // Debounce function to limit validation frequency
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Handle save
  const handleSave = () => {
    const isValid = validateYaml(yaml)

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

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

  // Format YAML
  const formatYaml = () => {
    try {
      const parsed = parse(yaml)
      const formatted = stringify(parsed, { indent: editorSettings.tabSize })
      setYaml(formatted)

      // Revalidate after formatting
      validateYaml(formatted)

      toast({
        title: "YAML formatted",
        description: "Your YAML has been formatted successfully.",
      })
    } catch (error) {
      toast({
        title: "Format Error",
        description: "Could not format YAML due to syntax errors.",
        variant: "destructive",
      })
    }
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
          <Button variant="outline" size="sm" onClick={formatYaml}>
            <span>Format</span>
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

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mx-4 my-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="yaml"
          value={yaml}
          onChange={(value) => setYaml(value || "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            scrollBeyondLastLine: true,
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
