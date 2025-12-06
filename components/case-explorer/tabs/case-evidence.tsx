import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Link } from "lucide-react"

const evidence = [
  {
    title: "Signed Contract",
    date: "Oct 1, 2024",
    category: "Agreement",
    source: "agreement.pdf",
    status: "Available",
    linkedEvent: "Contract Signed",
  },
  {
    title: "March Invoice",
    date: "Mar 15, 2024",
    category: "Invoice",
    source: "invoice-march.pdf",
    status: "Available",
    linkedEvent: "Initial Payment",
  },
  {
    title: "WhatsApp Chat",
    date: "Nov 12, 2024",
    category: "Chat",
    source: "whatsapp-export.pdf",
    status: "Available",
    linkedEvent: "Discussion",
  },
  {
    title: "Bank Statement",
    date: "Apr 2024",
    category: "Financial",
    source: null,
    status: "Missing",
    linkedEvent: null,
  },
]

const categoryColors: Record<string, string> = {
  Agreement: "bg-primary/10 text-primary",
  Invoice: "bg-success/10 text-success",
  Chat: "bg-chart-2/10 text-chart-2",
  Financial: "bg-warning/10 text-warning",
}

export function CaseEvidence() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evidence Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Source Document</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Linked Event</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evidence.map((item) => (
            <TableRow key={item.title}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>
                <Badge className={categoryColors[item.category]}>{item.category}</Badge>
              </TableCell>
              <TableCell>
                {item.source ? (
                  <Button variant="link" className="h-auto p-0 text-primary">
                    {item.source}
                  </Button>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={item.status === "Available" ? "default" : "destructive"}
                  className={item.status === "Available" ? "bg-success/10 text-success" : ""}
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                {item.linkedEvent ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Link className="h-3 w-3" />
                    {item.linkedEvent}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
