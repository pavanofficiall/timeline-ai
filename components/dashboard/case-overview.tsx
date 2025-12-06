import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const cases = [
  {
    id: "CASE-001",
    title: "Smith vs. Johnson Corp",
    client: "Robert Smith",
    status: "Active",
    lastUpdated: "Today",
    progress: 75,
  },
  {
    id: "CASE-002",
    title: "Estate of Williams",
    client: "Williams Family",
    status: "Pending",
    lastUpdated: "Yesterday",
    progress: 45,
  },
  {
    id: "CASE-003",
    title: "Tech Solutions Ltd Dispute",
    client: "Tech Solutions Ltd",
    status: "Active",
    lastUpdated: "2 days ago",
    progress: 60,
  },
]

export function CaseOverview() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Active Cases</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cases" className="gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {cases.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-card-foreground">{c.title}</span>
                <Badge variant={c.status === "Active" ? "default" : "secondary"} className="text-xs">
                  {c.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {c.client} • {c.id}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-card-foreground">{c.progress}%</div>
                <div className="text-xs text-muted-foreground">{c.lastUpdated}</div>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${c.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
