import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageSquare, DollarSign, FileSignature, Mic, Link } from "lucide-react"

const categories = [
  {
    name: "Documents",
    icon: FileText,
    color: "bg-primary/10 text-primary",
    items: [
      { title: "Service Agreement", date: "Oct 1, 2024", linked: true },
      { title: "Amendment Letter", date: "Oct 15, 2024", linked: true },
      { title: "Termination Notice", date: "Nov 20, 2024", linked: false },
    ],
  },
  {
    name: "Chats",
    icon: MessageSquare,
    color: "bg-chart-2/10 text-chart-2",
    items: [
      { title: "WhatsApp Export", date: "Nov 12, 2024", linked: true },
      { title: "Email Thread", date: "Oct 25, 2024", linked: true },
    ],
  },
  {
    name: "Payments",
    icon: DollarSign,
    color: "bg-success/10 text-success",
    items: [
      { title: "Invoice March", date: "Mar 15, 2024", linked: true },
      { title: "Bank Statement", date: "Apr 2024", linked: false },
      { title: "Receipt", date: "Dec 3, 2024", linked: true },
    ],
  },
  {
    name: "Contracts",
    icon: FileSignature,
    color: "bg-warning/10 text-warning",
    items: [
      { title: "Main Contract v2", date: "Oct 1, 2024", linked: true },
      { title: "NDA", date: "Sep 15, 2024", linked: false },
    ],
  },
  {
    name: "Audio",
    icon: Mic,
    color: "bg-chart-5/10 text-chart-5",
    items: [{ title: "Call Recording", date: "Nov 5, 2024", linked: true }],
  },
]

export function EvidenceBoard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {categories.map((category) => (
        <Card key={category.name} className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <div className={`rounded-lg p-1.5 ${category.color}`}>
                <category.icon className="h-4 w-4" />
              </div>
              {category.name}
              <Badge variant="secondary" className="ml-auto">
                {category.items.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {category.items.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-card-foreground">{item.title}</p>
                  {item.linked && <Link className="h-3 w-3 text-primary" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
                <Badge
                  variant="outline"
                  className={`mt-2 text-xs ${
                    item.linked ? "border-success/50 text-success" : "border-muted text-muted-foreground"
                  }`}
                >
                  {item.linked ? "Linked" : "Not Linked"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
