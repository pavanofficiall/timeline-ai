import { CaseHeader } from "@/components/case-explorer/case-header"
import { CaseTabs } from "@/components/case-explorer/case-tabs"

export default function CaseExplorerPage() {
  return (
    <div className="space-y-6">
      <CaseHeader />
      <CaseTabs />
    </div>
  )
}
