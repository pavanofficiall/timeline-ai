"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseSummary } from "./tabs/case-summary"
import { CaseTimeline } from "./tabs/case-timeline"
import { CaseParties } from "./tabs/case-parties"
import { CaseDocuments } from "./tabs/case-documents"
import { CaseEvidence } from "./tabs/case-evidence"
import { CasePayments } from "./tabs/case-payments"
import { CaseNotes } from "./tabs/case-notes"

export function CaseTabs() {
  return (
    <Tabs defaultValue="summary" className="space-y-4">
      <TabsList className="bg-muted">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="parties">Parties</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="evidence">Evidence</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>

      <TabsContent value="summary">
        <CaseSummary />
      </TabsContent>
      <TabsContent value="timeline">
        <CaseTimeline />
      </TabsContent>
      <TabsContent value="parties">
        <CaseParties />
      </TabsContent>
      <TabsContent value="documents">
        <CaseDocuments />
      </TabsContent>
      <TabsContent value="evidence">
        <CaseEvidence />
      </TabsContent>
      <TabsContent value="payments">
        <CasePayments />
      </TabsContent>
      <TabsContent value="notes">
        <CaseNotes />
      </TabsContent>
    </Tabs>
  )
}
