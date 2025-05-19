"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LogEntry {
  timestamp: Date
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  message: string
}

interface LiveLogFeedProps {
  logs: LogEntry[]
  maxHeight?: string
}

export function LiveLogFeed({ logs, maxHeight = "400px" }: LiveLogFeedProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isAutoScrollEnabled = useRef(true)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current && isAutoScrollEnabled.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [logs])

  // Handle scroll events to disable auto-scroll when user scrolls up
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      isAutoScrollEnabled.current = isAtBottom
    }
  }

  // Get log level color
  const getLogLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "INFO":
        return "text-blue-500"
      case "WARN":
        return "text-amber-500"
      case "ERROR":
        return "text-red-500"
      case "DEBUG":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div
      className="font-mono text-sm bg-black text-white p-4 rounded-md"
      style={{ maxHeight, overflowY: "auto" }}
      ref={scrollAreaRef}
      onScroll={handleScroll}
    >
      {logs.map((log, index) => (
        <div key={index} className="whitespace-pre-wrap mb-1">
          <span className="text-gray-400">[{log.timestamp.toLocaleTimeString()}]</span>{" "}
          <span className={cn("font-bold", getLogLevelColor(log.level))}>{log.level}:</span> <span>{log.message}</span>
        </div>
      ))}
      {logs.length === 0 && <div className="text-gray-500">No logs available</div>}

      {/* Auto-scroll indicator */}
      {!isAutoScrollEnabled.current && logs.length > 0 && (
        <div className="sticky bottom-0 right-0 p-2 bg-black bg-opacity-80 text-center">
          <button
            className="text-xs text-blue-400 hover:text-blue-300"
            onClick={() => {
              isAutoScrollEnabled.current = true
              if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
              }
            }}
          >
            ↓ Scroll to latest logs
          </button>
        </div>
      )}
    </div>
  )
}
