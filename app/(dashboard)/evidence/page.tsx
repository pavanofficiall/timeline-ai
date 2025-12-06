import { EvidenceBoard } from "@/components/evidence/evidence-board"
import { EvidenceFilters } from "@/components/evidence/evidence-filters"

export default function EvidencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Evidence Organizer</h1>
        <p className="text-muted-foreground">Organize and categorize evidence for your cases.</p>
      </div>

      <EvidenceFilters />
      <EvidenceBoard />
    </div>
  )
}
