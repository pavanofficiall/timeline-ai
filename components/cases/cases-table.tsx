import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const cases = [
  {
    id: "CASE-001",
    title: "Smith vs. Johnson Corp",
    client: "Robert Smith",
    type: "Civil Dispute",
    lastUpdated: "Today",
    status: "Active",
  },
  {
    id: "CASE-002",
    title: "Estate of Williams",
    client: "Williams Family",
    type: "Probate",
    lastUpdated: "Yesterday",
    status: "Pending",
  },
  {
    id: "CASE-003",
    title: "Tech Solutions Ltd Dispute",
    client: "Tech Solutions Ltd",
    type: "Commercial",
    lastUpdated: "2 days ago",
    status: "Active",
  },
  {
    id: "CASE-004",
    title: "Davis Property Claim",
    client: "Michael Davis",
    type: "Property",
    lastUpdated: "1 week ago",
    status: "Closed",
  },
  {
    id: "CASE-005",
    title: "Garcia Employment Case",
    client: "Maria Garcia",
    type: "Employment",
    lastUpdated: "2 weeks ago",
    status: "Active",
  },
]

const statusColors: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Closed: "bg-muted text-muted-foreground",
}

export function CasesTable() {
  return (
    <Card className="border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-card-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.id}</p>
                </div>
              </TableCell>
              <TableCell>{c.client}</TableCell>
              <TableCell>{c.type}</TableCell>
              <TableCell>{c.lastUpdated}</TableCell>
              <TableCell>
                <Badge className={statusColors[c.status]}>{c.status}</Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/case-explorer">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
