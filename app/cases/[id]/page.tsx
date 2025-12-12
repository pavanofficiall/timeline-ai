"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  FileUp,
  CheckCircle2,
  UploadCloud,
  File as FileIcon,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio2,
  FileVideo2,
  Image as ImageIcon,
  Info,
  Paperclip,
} from "lucide-react"

type Doc = { id: string; filename: string; uploaded_at?: string; status?: string }
type Event = { id?: string; date?: string; title?: string; description?: string; confidence_score?: number }

export default function CaseWorkspacePage() {
  const params = useParams<{ id: string }>()
  const caseId = params?.id as string
  const [docs, setDocs] = useState<Doc[]>([])
  const [timeline, setTimeline] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Uploader UI (matching /upload)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState<number>(0)
  const [dragOver, setDragOver] = useState(false)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function getFileMeta(f: File | null) {
    const def = { label: "File", Icon: FileIcon, classes: "bg-muted text-muted-foreground" }
    if (!f) return def
    const name = f.name.toLowerCase()
    const ext = name.includes(".") ? name.split(".").pop() || "" : ""
    const byExt = (e: string) => ext === e
    const isImage = /(jpg|jpeg|png|gif|webp|bmp|tiff)/i.test(ext)
    if (byExt("pdf")) return { label: "PDF", Icon: FileText, classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" }
    if (byExt("doc") || byExt("docx")) return { label: "DOC", Icon: FileText, classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200" }
    if (byExt("xls") || byExt("xlsx") || byExt("csv")) return { label: "Sheet", Icon: FileSpreadsheet, classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200" }
    if (byExt("ppt") || byExt("pptx")) return { label: "Slides", Icon: FileText, classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200" }
    if (byExt("zip") || byExt("rar") || byExt("7z")) return { label: "Archive", Icon: FileArchive, classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200" }
    if (byExt("mp3") || byExt("wav")) return { label: "Audio", Icon: FileAudio2, classes: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200" }
    if (byExt("mp4") || byExt("mov") || byExt("mkv")) return { label: "Video", Icon: FileVideo2, classes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200" }
    if (isImage) return { label: "Image", Icon: ImageIcon, classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200" }
    if (byExt("txt") || byExt("md")) return { label: "Text", Icon: FileText, classes: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200" }
    return def
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) setFile(f as File)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!dragOver) setDragOver(true)
  }, [dragOver])

  const onDragLeave = useCallback(() => setDragOver(false), [])

  async function load() {
    try {
      setLoading(true)
      const [dRes, tRes] = await Promise.all([
        fetch(`/api/cases/${caseId}/docs`).then((r) => r.json()),
        fetch(`/api/cases/${caseId}/timeline`).then((r) => r.json()),
      ])
      setDocs(dRes?.documents || [])
      setTimeline(tRes?.timeline || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load case")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (caseId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResultMsg(null)
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.set("file", file)
      setPercent(15)
      const res = await fetch(`/api/cases/${caseId}/upload`, { method: "POST", body: fd })
      let json: any = null
      try {
        json = await res.json()
      } catch (_) {}
      if (!res.ok) {
        const msg = json?.error || `Upload failed (${res.status})`
        const details = json?.details ? `: ${json.details}` : ""
        throw new Error(`${msg}${details}`)
      }
      setPercent(90)
      setResultMsg("Upload successful")
      setPercent(100)
      setFile(null)
      await load()
    } catch (err: any) {
      setError(err?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Case Workspace</h1>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>

      {/* Upload (same UI as /upload) */}
      <Card className="border-border bg-card">
        <div className="p-6 space-y-5">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center transition-colors " +
              (dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40")
            }
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="text-base font-medium">Drag & drop your file here</div>
              <div className="text-xs text-muted-foreground">PDF, PNG, JPG up to ~10MB</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="sr-only"
            />
            <Button type="button" variant="secondary" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
          </div>

          {/* Selected file summary */}
          {file && (() => {
            const meta = getFileMeta(file)
            return (
              <div className="flex items-center gap-3 rounded-md border p-3 text-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${meta.classes}`}>
                  <meta.Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="truncate font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB • {meta.label}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setFile(null)} disabled={uploading}>
                  Clear
                </Button>
              </div>
            )
          })()}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Info className="h-3.5 w-3.5" /> Max size ~10MB. For scanned PDFs, OCR may take longer.
              </div>
              <Button type="submit" disabled={!file || uploading} className="gap-2">
                {uploading ? <Spinner className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>

            {uploading && (
              <div className="pt-1">
                <Progress value={percent} />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resultMsg && (
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{resultMsg}</span>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1 text-sm">
                  <div>Timeline updates will appear below once processing completes.</div>
                </div>
              </div>
            )}
          </form>
        </div>
      </Card>

      {/* Documents */}
      <Card className="border">
        <div className="border-b p-3 font-medium">Documents</div>
        <div className="p-3 space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2"><Spinner /> Loading…</div>
          ) : docs.length ? (
            docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{d.filename}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : ""} • {d.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No documents yet.</div>
          )}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="border">
        <div className="border-b p-3 font-medium">Master Timeline</div>
        <div className="p-4">
          {loading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2"><Spinner /> Loading timeline…</div>
          ) : timeline.length ? (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6">
                {timeline.map((ev, idx) => {
                  const d = ev.date ? new Date(ev.date) : null
                  return (
                    <div key={ev.id || idx} className="relative">
                      <div className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-primary" />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-blue-600">
                          {d ? d.toLocaleDateString() : "Date unknown"}
                        </div>
                        <div className="mt-1 text-base font-medium">{ev.title || "Event"}</div>
                        {ev.description && <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No events found.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
