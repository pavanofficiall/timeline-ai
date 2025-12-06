import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, File, Eye, Download } from "lucide-react"

const documents = [
  { name: "agreement.pdf", type: "pdf", size: "2.4 MB", date: "Dec 5, 2024" },
  { name: "invoice-march.pdf", type: "pdf", size: "156 KB", date: "Dec 3, 2024" },
  { name: "evidence-001.jpg", type: "image", size: "1.2 MB", date: "Nov 28, 2024" },
  { name: "contract-v2.pdf", type: "pdf", size: "3.1 MB", date: "Nov 20, 2024" },
  { name: "bank-statement.pdf", type: "pdf", size: "890 KB", date: "Nov 15, 2024" },
  { name: "whatsapp-export.pdf", type: "pdf", size: "245 KB", date: "Nov 10, 2024" },
]

const typeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  image: ImageIcon,
  other: File,
}

export function CaseDocuments() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => {
        const Icon = typeIcons[doc.type] || File
        return (
          <Card key={doc.name} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.size} • {doc.date}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
