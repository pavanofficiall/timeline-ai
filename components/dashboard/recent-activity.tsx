import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Sparkles, FileText, Clock } from "lucide-react"

const activities = [
  {
    icon: Upload,
    text: "Uploaded agreement.pdf",
    time: "2 min ago",
    color: "text-primary",
  },
  {
    icon: Sparkles,
    text: "AI detected 4 new events",
    time: "15 min ago",
    color: "text-chart-2",
  },
  {
    icon: FileText,
    text: "Generated draft notice",
    time: "1 hour ago",
    color: "text-success",
  },
  {
    icon: Clock,
    text: "Timeline updated for CASE-001",
    time: "3 hours ago",
    color: "text-warning",
  },
  {
    icon: Upload,
    text: "Uploaded invoice-march.pdf",
    time: "5 hours ago",
    color: "text-primary",
  },
]

export function RecentActivity() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-muted p-1.5">
              <activity.icon className={`h-3 w-3 ${activity.color}`} />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm text-card-foreground">{activity.text}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
