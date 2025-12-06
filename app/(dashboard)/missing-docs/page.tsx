import { MissingDocCards } from "@/components/missing-docs/missing-doc-cards"

export default function MissingDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Missing Documents</h1>
        <p className="text-muted-foreground">Documents that AI has identified as missing from your cases.</p>
      </div>

      <MissingDocCards />
    </div>
  )
}
