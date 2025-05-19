"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Search, Filter } from "lucide-react"
import Link from "next/link"
import { LiveLogFeed } from "@/components/live-log-feed"

// Mock logs data
const mockLogs = [
  {
    timestamp: new Date(Date.now() - 150000),
    level: "INFO",
    message: "Starting workflow 'Customer Onboarding'",
  },
  {
    timestamp: new Date(Date.now() - 145000),
    level: "INFO",
    message: "Starting step 'Validate Input'",
  },
  {
    timestamp: new Date(Date.now() - 140000),
    level: "DEBUG",
    message: "Validating customer data: { name: 'John Doe', email: 'john@example.com' }",
  },
  {
    timestamp: new Date(Date.now() - 135000),
    level: "DEBUG",
    message: "Running validation rules: ['required', 'email', 'unique']",
  },
  {
    timestamp: new Date(Date.now() - 130000),
    level: "DEBUG",
    message: "All validation rules passed",
  },
  {
    timestamp: new Date(Date.now() - 125000),
    level: "INFO",
    message: "Customer data validated successfully",
  },
  {
    timestamp: new Date(Date.now() - 120000),
    level: "INFO",
    message: "Step 'Validate Input' completed successfully",
  },
  {
    timestamp: new Date(Date.now() - 119000),
    level: "INFO",
    message: "Starting step 'Upload Signature'",
  },
  {
    timestamp: new Date(Date.now() - 115000),
    level: "DEBUG",
    message: "Preparing signature file for upload",
  },
  {
    timestamp: new Date(Date.now() - 110000),
    level: "DEBUG",
    message: "Signature file size: 256KB",
  },
  {
    timestamp: new Date(Date.now() - 105000),
    level: "DEBUG",
    message: "Uploading signature to secure storage",
  },
  {
    timestamp: new Date(Date.now() - 100000),
    level: "DEBUG",
    message: "Upload progress: 25%",
  },
  {
    timestamp: new Date(Date.now() - 90000),
    level: "DEBUG",
    message: "Upload progress: 50%",
  },
  {
    timestamp: new Date(Date.now() - 80000),
    level: "DEBUG",
    message: "Upload progress: 75%",
  },
  {
    timestamp: new Date(Date.now() - 70000),
    level: "DEBUG",
    message: "Upload progress: 100%",
  },
  {
    timestamp: new Date(Date.now() - 60000),
    level: "DEBUG",
    message: "Verifying uploaded signature",
  },
  {
    timestamp: new Date(Date.now() - 50000),
    level: "DEBUG",
    message: "Signature verification successful",
  },
  {
    timestamp: new Date(Date.now() - 40000),
    level: "INFO",
    message: "Signature uploaded and verified",
  },
  {
    timestamp: new Date(Date.now() - 30000),
    level: "INFO",
    message: "Step 'Upload Signature' completed successfully",
  },
  {
    timestamp: new Date(Date.now() - 29000),
    level: "INFO",
    message: "Starting step 'Await Bank Response'",
  },
  {
    timestamp: new Date(Date.now() - 28000),
    level: "DEBUG",
    message: "Preparing bank verification request",
  },
  {
    timestamp: new Date(Date.now() - 27000),
    level: "DEBUG",
    message: "Request payload: { customerId: 'CUST-12345', accountType: 'checking' }",
  },
  {
    timestamp: new Date(Date.now() - 26000),
    level: "INFO",
    message: "Sending request to bank verification API",
  },
  {
    timestamp: new Date(Date.now() - 25000),
    level: "WARN",
    message: "Bank API response time is slower than expected",
  },
  {
    timestamp: new Date(Date.now() - 20000),
    level: "DEBUG",
    message: "Waiting for bank API response...",
  },
  {
    timestamp: new Date(Date.now() - 15000),
    level: "DEBUG",
    message: "Still waiting for bank API response...",
  },
  {
    timestamp: new Date(Date.now() - 10000),
    level: "DEBUG",
    message: "Bank API response received",
  },
  {
    timestamp: new Date(Date.now() - 9000),
    level: "DEBUG",
    message: "Processing bank API response",
  },
  {
    timestamp: new Date(Date.now() - 8000),
    level: "ERROR",
    message: "Bank API returned an error: 'Account verification failed'",
  },
  {
    timestamp: new Date(Date.now() - 7000),
    level: "INFO",
    message: "Retrying bank verification with fallback method",
  },
  {
    timestamp: new Date(Date.now() - 6000),
    level: "DEBUG",
    message: "Preparing fallback verification request",
  },
  {
    timestamp: new Date(Date.now() - 5000),
    level: "INFO",
    message: "Sending fallback verification request",
  },
  {
    timestamp: new Date(Date.now() - 4000),
    level: "DEBUG",
    message: "Fallback verification response received",
  },
  {
    timestamp: new Date(Date.now() - 3000),
    level: "INFO",
    message: "Fallback verification successful",
  },
  {
    timestamp: new Date(Date.now() - 2000),
    level: "INFO",
    message: "Step 'Await Bank Response' completed successfully",
  },
]

export default function WorkflowLogsPage() {
  const params = useParams()
  const [logs, setLogs] = useState(mockLogs)
  const [filteredLogs, setFilteredLogs] = useState(mockLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [logLevel, setLogLevel] = useState("all")

  // Filter logs based on search query and log level
  useEffect(() => {
    let filtered = logs

    if (searchQuery) {
      filtered = filtered.filter((log) => log.message.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (logLevel !== "all") {
      filtered = filtered.filter((log) => log.level === logLevel)
    }

    setFilteredLogs(filtered)
  }, [logs, searchQuery, logLevel])

  // Handle download logs
  const handleDownloadLogs = () => {
    const logsText = filteredLogs
      .map((log) => `[${log.timestamp.toISOString()}] ${log.level}: ${log.message}`)
      .join("\n")

    const blob = new Blob([logsText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `workflow-${params.id}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/workflow/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Workflow</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Workflow Logs</h1>
        </div>

        <Button variant="outline" onClick={handleDownloadLogs}>
          <Download className="mr-2 h-4 w-4" />
          Download Logs
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Log Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARN">Warning</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="DEBUG">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <LiveLogFeed logs={filteredLogs} maxHeight="600px" />
        </CardContent>
      </Card>
    </div>
  )
}
