import { TimelineFilters } from "@/components/timeline/timeline-filters"
import { TimelineView } from "@/components/timeline/timeline-view"

export function CaseTimeline() {
  return (
    <div className="space-y-4">
      <TimelineFilters />
      <TimelineView />
    </div>
  )
}
