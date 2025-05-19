"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

export function OnboardingTutorial() {
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("hasVisitedBefore")
    if (!hasVisited) {
      setIsFirstVisit(true)
      setShowTutorial(true)
      localStorage.setItem("hasVisitedBefore", "true")
    }
  }, [])

  const steps = [
    {
      title: "Welcome to WorkflowAI",
      description: "Let's take a quick tour to help you get started with our workflow management platform.",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      title: "Dashboard Overview",
      description:
        "The dashboard gives you a quick overview of your workflows and key metrics. You can see recent workflows and their status at a glance.",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      title: "AI Workflow Builder",
      description:
        "Create new workflows by describing what you need in plain language. Our AI will generate a workflow definition for you to review and customize.",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      title: "Workflow Library",
      description:
        "Browse, search, and manage all your saved workflows. You can filter by tags and sort by different criteria.",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      title: "Feedback Collection",
      description:
        "After running a workflow, you'll be prompted to provide feedback. This helps us improve the platform and your workflow definitions.",
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowTutorial(false)
    }
  }

  const handleSkip = () => {
    setShowTutorial(false)
  }

  if (!isFirstVisit || !showTutorial) {
    return null
  }

  return (
    <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>{steps[currentStep].description}</DialogDescription>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleSkip}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="flex justify-center p-4">
          <img
            src={steps[currentStep].image || "/placeholder.svg"}
            alt={steps[currentStep].title}
            className="rounded-md border"
          />
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${index === currentStep ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
            <Button onClick={handleNext}>{currentStep < steps.length - 1 ? "Next" : "Finish"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
