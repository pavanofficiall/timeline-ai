import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, FileText, MessageSquare, AlertCircle } from "lucide-react"

const stats = [
  {
    label: "Total Cases",
    value: "24",
    change: "+3 this month",
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Pending Documents",
    value: "12",
    change: "5 urgent",
    icon: FileText,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    label: "Drafts Generated",
    value: "156",
    change: "+18 this week",
    icon: MessageSquare,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "AI Chats Used",
    value: "89",
    change: "Active session",
    icon: AlertCircle,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-card-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
