import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/dashboard" className="text-lg font-medium transition-colors hover:text-primary">
        WorkflowAI
      </Link>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link href="/builder" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Builder
      </Link>
      <Link
        href="/workflow-canvas"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Canvas
      </Link>
      <Link
        href="/yaml-editor"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        YAML Editor
      </Link>
      <Link href="/library" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Library
      </Link>
      <Link href="/settings" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Settings
      </Link>
    </nav>
  )
}
