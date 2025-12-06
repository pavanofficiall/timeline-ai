import { TimelineFilters } from "@/components/timeline/timeline-filters"
import { TimelineView } from "@/components/timeline/timeline-view"

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Case Timeline</h1>
        <p className="text-muted-foreground">View and manage events extracted from your case documents.</p>
      </div>

      <TimelineFilters />
      <TimelineView />
    </div>
  )
}
