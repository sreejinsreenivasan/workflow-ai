"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users } from "lucide-react"

interface CollaborationIndicatorProps {
  count: number
}

export function CollaborationIndicator({ count }: CollaborationIndicatorProps) {
  // Mock user data
  const users = [
    { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=32&width=32", initials: "JD" },
    { id: 2, name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32", initials: "JS" },
  ]

  return (
    <div className="flex items-center">
      <div className="flex items-center mr-2">
        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{count} users editing</span>
      </div>
      <div className="flex -space-x-2">
        <TooltipProvider>
          {users.slice(0, 3).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  )
}
