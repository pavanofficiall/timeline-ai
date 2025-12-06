import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Share, MoreHorizontal } from "lucide-react"

export function CaseHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Smith vs. Johnson Corp</h1>
          <Badge className="bg-primary/10 text-primary">Active</Badge>
        </div>
        <p className="mt-1 text-muted-foreground">CASE-001 • Civil Dispute</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share className="h-4 w-4" />
          Share
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
