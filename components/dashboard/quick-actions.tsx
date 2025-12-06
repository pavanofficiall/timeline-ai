import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Plus, Clock, FolderOpen } from "lucide-react"
import Link from "next/link"

const actions = [
  { label: "Upload Document", icon: Upload, href: "/upload" },
  { label: "Start New Case", icon: Plus, href: "/cases" },
  { label: "Open Timeline", icon: Clock, href: "/timeline" },
  { label: "Case Explorer", icon: FolderOpen, href: "/case-explorer" },
]

export function QuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button key={action.label} variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent" asChild>
            <Link href={action.href}>
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
