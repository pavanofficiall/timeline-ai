import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Upload, Lightbulb } from "lucide-react"

const missingDocs = [
  {
    title: "Invoice for 2nd payment",
    reason: "To verify the second installment was received",
    suggestion: "Upload the invoice or bank transaction record",
    priority: "High",
    case: "CASE-001",
  },
  {
    title: "WhatsApp conversation screenshot (May 12)",
    reason: "To support the timeline of negotiations",
    suggestion: "Export chat from WhatsApp and upload as PDF",
    priority: "Medium",
    case: "CASE-001",
  },
  {
    title: "Bank statement for April 2024",
    reason: "To verify advance payment claim",
    suggestion: "Upload bank PDF or screenshot",
    priority: "High",
    case: "CASE-001",
  },
  {
    title: "Original signed contract",
    reason: "Current version appears to be unsigned draft",
    suggestion: "Scan and upload the physically signed copy",
    priority: "Critical",
    case: "CASE-002",
  },
  {
    title: "Employment termination letter",
    reason: "Required to establish termination date",
    suggestion: "Request from client or former employer",
    priority: "High",
    case: "CASE-005",
  },
  {
    title: "Meeting minutes from Oct 15",
    reason: "To document verbal agreements",
    suggestion: "Create summary document if notes exist",
    priority: "Low",
    case: "CASE-003",
  },
]

const priorityColors: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-warning/10 text-warning",
  Medium: "bg-primary/10 text-primary",
  Low: "bg-muted text-muted-foreground",
}

export function MissingDocCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {missingDocs.map((doc, i) => (
        <Card key={i} className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-base font-semibold text-card-foreground">{doc.title}</CardTitle>
              </div>
              <Badge className={priorityColors[doc.priority]}>{doc.priority}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{doc.case}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Why needed</p>
              <p className="text-sm text-card-foreground">{doc.reason}</p>
            </div>

            <div className="rounded-lg bg-accent/50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-accent-foreground">
                <Lightbulb className="h-3 w-3" />
                AI Suggestion
              </div>
              <p className="mt-1 text-sm text-card-foreground">{doc.suggestion}</p>
            </div>

            <Button className="w-full gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
