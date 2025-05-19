"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export function Search() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`relative ${isExpanded ? "w-64" : "w-9"} transition-all duration-300`}>
      <SearchIcon
        className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
        onClick={() => setIsExpanded(true)}
      />
      <Input
        type="search"
        placeholder="Search..."
        className={`pl-8 h-9 ${isExpanded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onBlur={() => setIsExpanded(false)}
        onFocus={() => setIsExpanded(true)}
      />
    </div>
  )
}
