"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Download, CheckCircle, Sparkles, Quote } from "lucide-react"

const suggestions = [
  {
    title: "Add Interest Clause",
    description: "Include statutory interest rate reference",
  },
  {
    title: "Strengthen Breach Language",
    description: "Use stronger breach of contract terminology",
  },
  {
    title: "Add Timeline Reference",
    description: "Include specific dates from timeline",
  },
]

const clauses = [
  "Standard limitation period clause",
  "Force majeure provision",
  "Jurisdiction clause for District Court",
]

const draftContent = `LEGAL NOTICE

Date: December 5, 2024

To,
Johnson Corp
456 Business Ave
New York, NY 10001

Subject: Notice for Recovery of Outstanding Payment under Service Agreement dated October 1, 2024

Dear Sir/Madam,

Under instructions from my client, Mr. Robert Smith, I hereby serve upon you the following legal notice:

1. That my client entered into a Service Agreement with your company dated October 1, 2024, for the provision of IT consulting services.

2. That as per the terms of the said Agreement, your company was obligated to pay a total sum of USD 75,000 (Seventy-Five Thousand US Dollars) for the services rendered.

3. That despite my client having duly performed all obligations under the Agreement, your company has willfully and deliberately failed to make the stipulated payments.

4. That the non-payment constitutes a clear breach of the contractual obligations undertaken by your company.

THEREFORE, you are hereby called upon to make payment of:
- Principal amount: USD 75,000
- Interest @ 18% per annum from the date of default
- Legal costs and expenses

within FIFTEEN (15) days of receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against your company without any further notice.

Yours faithfully,

John Doe
Attorney at Law`

export function DraftOutput() {
  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">Generated Draft</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Copy className="h-3 w-3" />
              Copy
            </Button>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </Button>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Download className="h-3 w-3" />
              Export
            </Button>
            <Button size="sm" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Mark as Final
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea value={draftContent} className="min-h-[400px] font-mono text-sm" readOnly />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
            >
              <div>
                <p className="text-sm font-medium text-card-foreground">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
              </div>
              <Button variant="outline" size="sm">
                Apply
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
            <Quote className="h-4 w-4 text-primary" />
            Recommended Clauses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {clauses.map((clause, i) => (
              <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-accent">
                + {clause}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
