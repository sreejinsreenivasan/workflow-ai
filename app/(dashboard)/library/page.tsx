"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowCard } from "@/components/workflow-card"
import { Badge } from "@/components/ui/badge"
import { Search, Grid, List, PlusCircle } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const workflows = [
  {
    id: "1",
    name: "Customer Onboarding",
    status: "active",
    lastRun: "2 hours ago",
    runCount: 45,
    description: "Process for onboarding new customers into the system",
    tags: ["customer", "onboarding", "automation"],
  },
  {
    id: "2",
    name: "Invoice Processing",
    status: "completed",
    lastRun: "5 hours ago",
    runCount: 32,
    description: "Automated invoice processing and approval workflow",
    tags: ["finance", "invoice", "approval"],
  },
  {
    id: "3",
    name: "Data Validation",
    status: "failed",
    lastRun: "1 day ago",
    runCount: 18,
    description: "Validates incoming data against predefined rules",
    tags: ["data", "validation", "rules"],
  },
  {
    id: "4",
    name: "Email Campaign",
    status: "paused",
    lastRun: "3 days ago",
    runCount: 27,
    description: "Automated email campaign sequence for marketing",
    tags: ["marketing", "email", "campaign"],
  },
  {
    id: "5",
    name: "User Authentication",
    status: "active",
    lastRun: "1 hour ago",
    runCount: 120,
    description: "User authentication and authorization process",
    tags: ["security", "authentication", "user"],
  },
  {
    id: "6",
    name: "Report Generation",
    status: "completed",
    lastRun: "12 hours ago",
    runCount: 56,
    description: "Automated report generation and distribution",
    tags: ["reporting", "automation", "analytics"],
  },
]

// Extract all unique tags
const allTags = Array.from(new Set(workflows.flatMap((w) => w.tags)))

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter workflows based on search query and selected tags
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => workflow.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Library</h1>
          <p className="text-muted-foreground">Browse and manage your saved workflows</p>
        </div>
        <Button asChild>
          <Link href="/builder">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find workflows by name, description, or tags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search workflows..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Workflows</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredWorkflows.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">No workflows found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  id={workflow.id}
                  name={workflow.name}
                  status={workflow.status as "active" | "completed" | "failed" | "paused"}
                  lastRun={workflow.lastRun}
                  runCount={workflow.runCount}
                  description={workflow.description}
                  tags={workflow.tags}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  id={workflow.id}
                  name={workflow.name}
                  status={workflow.status as "active" | "completed" | "failed" | "paused"}
                  lastRun={workflow.lastRun}
                  runCount={workflow.runCount}
                  description={workflow.description}
                  tags={workflow.tags}
                  variant="list"
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tab contents would filter by status */}
        <TabsContent value="active" className="space-y-4">
          {/* Similar structure as "all" but filtered for active workflows */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
