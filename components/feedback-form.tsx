"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface FeedbackFormProps {
  workflowId: string
  workflowName: string
  isOpen: boolean
  onClose: () => void
}

export function FeedbackForm({ workflowId, workflowName, isOpen, onClose }: FeedbackFormProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState<string | null>(null)
  const [showAdditionalQuestions, setShowAdditionalQuestions] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [missingFeatures, setMissingFeatures] = useState("")

  const handleSubmit = () => {
    // Here you would submit the feedback to your backend
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
    })

    // Reset form
    setRating(null)
    setShowAdditionalQuestions(false)
    setFeedback("")
    setMissingFeatures("")

    onClose()
  }

  const handleRatingChange = (value: string) => {
    setRating(value)
    // Show additional questions for ratings below 4
    setShowAdditionalQuestions(Number.parseInt(value) < 4)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Workflow Feedback</DialogTitle>
          <DialogDescription>How was your experience with the "{workflowName}" workflow?</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>How would you rate the ease of use?</Label>
            <RadioGroup value={rating || ""} onValueChange={handleRatingChange}>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem value={value.toString()} id={`rating-${value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`rating-${value}`}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-muted bg-background hover:bg-muted hover:text-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground"
                    >
                      {value}
                    </Label>
                    <span className="text-xs">{value === 1 ? "Poor" : value === 5 ? "Excellent" : ""}</span>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">What did you think of this workflow?</Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          {showAdditionalQuestions && (
            <div className="space-y-2">
              <Label htmlFor="missing-features">What features were missing or could be improved?</Label>
              <Textarea
                id="missing-features"
                placeholder="Tell us what would make this workflow better..."
                value={missingFeatures}
                onChange={(e) => setMissingFeatures(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!rating}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
