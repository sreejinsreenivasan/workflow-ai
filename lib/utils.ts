import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility for generating mapping expressions
export function generateMappingExpression(nodeId: string, fieldPath: string, defaultValue?: string): string {
  const path = `${nodeId}.output.${fieldPath}`
  if (defaultValue !== undefined) {
    return `{{ get('${path}', default=${defaultValue}) }}`
  }
  return `{{ get('${path}') }}`
}

// Utility for parsing mapping expressions (optional, but good for round-tripping)
export function parseMappingExpression(expression: string): {
  nodeId: string | null
  fieldPath: string | null
  defaultValue: string | null
} {
  const regex = /\{\{\s*get$$'([^']+?)'\s*(?:,\s*default=(.+?))?\s*$$\s*\}\}/
  const match = expression.match(regex)

  if (match) {
    const fullPath = match[1] // e.g., 'node_name.output.field_name'
    const defaultValue = match[2] || null

    const parts = fullPath.split(".")
    if (parts.length >= 3 && parts[1] === "output") {
      const nodeId = parts[0]
      const fieldPath = parts.slice(2).join(".")
      return { nodeId, fieldPath, defaultValue }
    }
  }
  return { nodeId: null, fieldPath: null, defaultValue: null }
}
