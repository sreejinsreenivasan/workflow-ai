"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditorSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    fontSize: number
    tabSize: number
    wordWrap: "off" | "on"
    minimap: boolean
    lineNumbers: boolean
  }
  onSettingsChange: (settings: EditorSettingsDialogProps["settings"]) => void
}

export function EditorSettingsDialog({ isOpen, onClose, settings, onSettingsChange }: EditorSettingsDialogProps) {
  const handleFontSizeChange = (value: string) => {
    const fontSize = Number.parseInt(value)
    if (!isNaN(fontSize) && fontSize > 0) {
      onSettingsChange({ ...settings, fontSize })
    }
  }

  const handleTabSizeChange = (value: string) => {
    const tabSize = Number.parseInt(value)
    if (!isNaN(tabSize) && tabSize > 0) {
      onSettingsChange({ ...settings, tabSize })
    }
  }

  const handleWordWrapChange = (value: string) => {
    onSettingsChange({ ...settings, wordWrap: value as "off" | "on" })
  }

  const handleMinimapChange = (checked: boolean) => {
    onSettingsChange({ ...settings, minimap: checked })
  }

  const handleLineNumbersChange = (checked: boolean) => {
    onSettingsChange({ ...settings, lineNumbers: checked })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="fontSize">Font Size</Label>
            <Input
              id="fontSize"
              type="number"
              min="8"
              max="32"
              value={settings.fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="tabSize">Tab Size</Label>
            <Input
              id="tabSize"
              type="number"
              min="1"
              max="8"
              value={settings.tabSize}
              onChange={(e) => handleTabSizeChange(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="wordWrap">Word Wrap</Label>
            <Select value={settings.wordWrap} onValueChange={handleWordWrapChange}>
              <SelectTrigger id="wordWrap">
                <SelectValue placeholder="Select word wrap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="on">On</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="minimap">Show Minimap</Label>
            <Switch id="minimap" checked={settings.minimap} onCheckedChange={handleMinimapChange} />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="lineNumbers">Show Line Numbers</Label>
            <Switch id="lineNumbers" checked={settings.lineNumbers} onCheckedChange={handleLineNumbersChange} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
