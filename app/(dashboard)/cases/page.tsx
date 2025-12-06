import { CasesTable } from "@/components/cases/cases-table"
import { CasesFilters } from "@/components/cases/cases-filters"

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Cases</h1>
        <p className="text-muted-foreground">Manage and track all your legal cases.</p>
      </div>

      <CasesFilters />
      <CasesTable />
    </div>
  )
}
