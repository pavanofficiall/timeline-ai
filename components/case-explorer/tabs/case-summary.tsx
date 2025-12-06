import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, Building2, FileText } from "lucide-react"

export function CaseSummary() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
            <Scale className="h-4 w-4" />
            Case Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Case Title</p>
              <p className="font-medium text-card-foreground">Smith vs. Johnson Corp</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Case Type</p>
              <p className="font-medium text-card-foreground">Civil Dispute</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Filing Date</p>
              <p className="font-medium text-card-foreground">Oct 15, 2024</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className="bg-success/10 text-success">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
            <Building2 className="h-4 w-4" />
            Court Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Court Name</p>
              <p className="font-medium text-card-foreground">District Court of Manhattan</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Judge</p>
              <p className="font-medium text-card-foreground">Hon. Sarah Mitchell</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Case Number</p>
              <p className="font-medium text-card-foreground">2024-CV-00892</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Hearing</p>
              <p className="font-medium text-card-foreground">Dec 20, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
            <FileText className="h-4 w-4" />
            Key Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Breach of service agreement dated October 1, 2024
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Non-payment of invoices totaling $75,000
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Failure to deliver contracted IT consulting services
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
