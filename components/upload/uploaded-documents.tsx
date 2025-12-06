import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Clock } from "lucide-react"

const documents = [
  { name: "agreement.pdf", uploadedAt: "Today, 2:30 PM", pages: 12 },
  { name: "invoice-march.pdf", uploadedAt: "Today, 11:15 AM", pages: 3 },
  { name: "contract-v2.pdf", uploadedAt: "Yesterday, 4:45 PM", pages: 28 },
  { name: "evidence-001.jpg", uploadedAt: "Yesterday, 2:00 PM", pages: 1 },
  { name: "bank-statement.pdf", uploadedAt: "Dec 2, 2024", pages: 5 },
]

export function UploadedDocuments() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((doc, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{doc.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {doc.uploadedAt}
                <span>•</span>
                <span>{doc.pages} pages</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
