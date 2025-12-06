"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  name: string
  size: string
  progress: number
  status: "uploading" | "complete" | "error"
}

export function FileUploadBox() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "contract-v2.pdf", size: "2.4 MB", progress: 100, status: "complete" },
    { name: "evidence-photos.zip", size: "15.2 MB", progress: 65, status: "uploading" },
  ])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    // Handle file upload logic here
  }, [])

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-card-foreground">Upload Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
        >
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-card-foreground">Drag and drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">Supports PDF, JPG, PNG up to 50MB</p>
          <Button variant="outline" size="sm" className="mt-4 bg-transparent">
            Browse Files
          </Button>
        </div>

        {/* Uploaded files */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full transition-all",
                          file.status === "complete" ? "bg-success" : "bg-primary",
                        )}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                    {file.status === "complete" && <CheckCircle className="h-4 w-4 text-success" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
