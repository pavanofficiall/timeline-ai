import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell } from "lucide-react"

const notifications = [
  { id: "new-docs", label: "New document uploads", enabled: true },
  { id: "ai-events", label: "AI detected events", enabled: true },
  { id: "case-updates", label: "Case status updates", enabled: false },
  { id: "reminders", label: "Deadline reminders", enabled: true },
]

export function SettingsNotifications() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
          <Bell className="h-4 w-4" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-center justify-between">
            <Label htmlFor={notification.id}>{notification.label}</Label>
            <Switch id={notification.id} defaultChecked={notification.enabled} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
