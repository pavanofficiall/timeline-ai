import { FileUploadBox } from "@/components/upload/file-upload-box"
import { ProcessingSteps } from "@/components/upload/processing-steps"
import { UploadedDocuments } from "@/components/upload/uploaded-documents"

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload Document</h1>
        <p className="text-muted-foreground">Upload legal documents to extract events and entities automatically.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <FileUploadBox />
          <ProcessingSteps />
        </div>
        <UploadedDocuments />
      </div>
    </div>
  )
}
