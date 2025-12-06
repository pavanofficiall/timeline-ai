"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { label: "Extracting text", status: "complete" },
  { label: "Detecting events", status: "complete" },
  { label: "Identifying entities", status: "processing" },
  { label: "Linking documents", status: "pending" },
]

export function ProcessingSteps() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">Processing Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === "complete" ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : step.status === "processing" ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span
              className={cn("text-sm", step.status === "pending" ? "text-muted-foreground" : "text-card-foreground")}
            >
              {step.label}
            </span>
            {step.status === "processing" && (
              <div className="ml-auto h-1 w-20 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 animate-pulse bg-primary" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
