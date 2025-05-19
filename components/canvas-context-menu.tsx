"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, ImageIcon } from "lucide-react"

interface CanvasContextMenuProps {
  x: number
  y: number
  onAutoLayout: () => void
  onExportImage: () => void
}

export function CanvasContextMenu({ x, y, onAutoLayout, onExportImage }: CanvasContextMenuProps) {
  return (
    <div
      className="absolute z-50 bg-popover text-popover-foreground rounded-md border shadow-md p-1 min-w-32"
      style={{ left: x, top: y }}
    >
      <div className="flex flex-col space-y-1">
        <Button variant="ghost" className="justify-start" onClick={onAutoLayout}>
          <LayoutGrid className="mr-2 h-4 w-4" />
          Auto Layout
        </Button>
        <Button variant="ghost" className="justify-start" onClick={onExportImage}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Export as Image
        </Button>
      </div>
    </div>
  )
}
