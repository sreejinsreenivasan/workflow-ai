"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface StatusFooterProps {
  suggestions: string[]
}

export function StatusFooter({ suggestions }: StatusFooterProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Suggestions</h3>
            <ul className="mt-1 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
