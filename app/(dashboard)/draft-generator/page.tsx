import { DraftForm } from "@/components/draft-generator/draft-form"
import { DraftOutput } from "@/components/draft-generator/draft-output"

export default function DraftGeneratorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Draft Generator</h1>
        <p className="text-muted-foreground">Generate legal documents with AI assistance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DraftForm />
        <DraftOutput />
      </div>
    </div>
  )
}
