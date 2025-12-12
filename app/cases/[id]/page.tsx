"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TopNavbar } from "@/components/layout/top-navbar"
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
type Event = { id?: string; date?: string; title?: string; description?: string; confidence_score?: number; type?: string; document_id?: string }
type CaseMeta = { id: string; title?: string | null }

export default function CaseWorkspacePage() {
  const params = useParams<{ id: string }>()
  const caseId = params?.id as string
  const [docs, setDocs] = useState<Doc[]>([])
  const [timeline, setTimeline] = useState<Event[]>([])
  const [caseParties, setCaseParties] = useState<{ id?: string; document_id?: string; name?: string; role?: string }[]>([])
  const [caseDocs, setCaseDocs] = useState<{ id: string; filename?: string; file_url?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [caseMeta, setCaseMeta] = useState<CaseMeta | null>(null)

  // Uploader UI (matching /upload)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState<number>(0)
  const [dragOver, setDragOver] = useState(false)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const [uploadSummary, setUploadSummary] = useState<{ added: number; duplicates: number; conflicts: number } | null>(null)
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
    const incoming = Array.from(e.dataTransfer?.files || [])
      .filter((f) => f.name.toLowerCase().endsWith(".pdf"))
    if (!incoming.length) return
    setFiles((prev) => {
      const merged = [...prev, ...incoming]
      if (merged.length > 3) {
        setError("You can upload up to 3 PDF files at once.")
      }
      return merged.slice(0, 3)
    })
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!dragOver) setDragOver(true)
  }, [dragOver])

  const onDragLeave = useCallback(() => setDragOver(false), [])

  async function load() {
    try {
      setLoading(true)
      const [mRes, dRes, tRes] = await Promise.all([
        fetch(`/api/cases/${caseId}`).then((r) => r.json()),
        fetch(`/api/cases/${caseId}/docs`).then((r) => r.json()),
        fetch(`/api/cases/${caseId}/timeline`).then((r) => r.json()),
      ])
      setCaseMeta(mRes?.case || null)
      setDocs(dRes?.documents || [])
      setTimeline(tRes?.timeline || [])
      setCaseDocs(tRes?.documents || [])
      setCaseParties(tRes?.parties || [])
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

  // (conflict UI removed per request)

  // Group conflicting events by title with their various dates and source documents
  const conflictGroups = useMemo(() => {
    const groups = new Map<string, { displayTitle: string; items: Event[] }>()
    for (const ev of timeline || []) {
      const key = (ev.title || "").trim().toLowerCase()
      if (!key) continue
      if (!groups.has(key)) groups.set(key, { displayTitle: ev.title || "Untitled", items: [] })
      groups.get(key)!.items.push(ev)
    }
    const result: { title: string; items: Event[] }[] = []
    for (const [k, g] of groups) {
      const uniqueDates = new Set(g.items.map(i => (i.date ? new Date(i.date).toISOString().slice(0,10) : 'null')))
      if (uniqueDates.size > 1) {
        const sorted = g.items.slice().sort((a, b) => {
          const da = a?.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY
          const db = b?.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY
          return da - db
        })
        result.push({ title: g.displayTitle, items: sorted })
      }
    }
    return result.sort((a, b) => a.title.localeCompare(b.title))
  }, [timeline])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResultMsg(null)
    if (!files.length) return
    setUploading(true)
    try {
      const total = Math.min(files.length, 3)
      let successCount = 0
      let addedTotal = 0
      let dupTotal = 0
      let confTotal = 0
      for (let i = 0; i < total; i++) {
        const f = files[i]
        const fd = new FormData()
        fd.set("file", f)
        setPercent(Math.floor((i / total) * 100))
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
        successCount++
        addedTotal += Number(json?.added || 0)
        dupTotal += Number(json?.duplicatesIgnored || 0)
        confTotal += Number(json?.conflictsFlagged || 0)
        setPercent(Math.floor(((i + 1) / total) * 100))
        // Refresh after each file to progressively show updates
        await load()
      }
      setResultMsg(`Uploaded ${successCount} file${successCount > 1 ? "s" : ""} successfully`)
      setUploadSummary({ added: addedTotal, duplicates: dupTotal, conflicts: confTotal })
      setFiles([])
    } catch (err: any) {
      setError(err?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />
      <main className="flex-1 p-6">
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Case Workspace</h1>
        {caseMeta?.title && (
          <p className="mt-1 text-sm text-muted-foreground">/ {caseMeta.title}</p>
        )}
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
              <div className="text-base font-medium">Drag & drop up to 3 PDFs</div>
              <div className="text-xs text-muted-foreground">PDF only, up to ~10MB each</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => {
                const next = Array.from(e.target.files || []).filter((f) => f.name.toLowerCase().endsWith(".pdf"))
                if (!next.length) return
                setFiles((prev) => {
                  const merged = [...prev, ...next]
                  if (merged.length > 3) {
                    setError("You can upload up to 3 PDF files at once.")
                  }
                  return merged.slice(0, 3)
                })
                e.currentTarget.value = ""
              }}
              className="sr-only"
            />
            <Button type="button" variant="secondary" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
          </div>

          {/* Selected files summary */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, idx) => {
                const meta = getFileMeta(f)
                return (
                  <div key={`${f.name}-${idx}`} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md ${meta.classes}`}>
                      <meta.Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB • {meta.label}</div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setFiles(files.filter((_, i) => i !== idx))} disabled={uploading}>
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Info className="h-3.5 w-3.5" /> Upload up to 3 PDFs. For scanned files, OCR may take longer.
              </div>
              <Button type="submit" disabled={!files.length || uploading} className="gap-2">
                {uploading ? <Spinner className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
                {uploading ? "Uploading…" : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
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
                  {uploadSummary && (
                    <div className="mt-1 text-muted-foreground">
                      <span className="mr-3">Events added: <span className="font-medium text-foreground">{uploadSummary.added}</span></span>
                      <span className="mr-3">Duplicates ignored: <span className="font-medium text-foreground">{uploadSummary.duplicates}</span></span>
                      <span>Conflicts flagged: <span className={`font-medium ${uploadSummary.conflicts > 0 ? 'text-red-600' : 'text-foreground'}`}>{uploadSummary.conflicts}</span></span>
                    </div>
                  )}
                </div>
                {uploadSummary?.conflicts ? (
                  <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-400/50 dark:bg-amber-900/20 dark:text-amber-200">
                    {uploadSummary.conflicts} potential conflict{uploadSummary.conflicts > 1 ? 's' : ''} detected (same title with differing dates). Review relevant events in the master timeline.
                  </div>
                ) : null}
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
                  const conf = typeof ev.confidence_score === "number" ? ev.confidence_score : undefined
                  const confColor = conf != null ? (conf > 0.8 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700") : "bg-gray-100 text-gray-700"
                  const confLabel = conf != null ? conf.toFixed(2) : "--"
                  const srcDoc = ev.document_id ? caseDocs.find((x) => x.id === ev.document_id) : undefined
                  const relatedParties = ev.document_id ? caseParties.filter((p) => p.document_id === ev.document_id) : []
                  const type = (ev as any).type as string | undefined
                  const typeStyle = (() => {
                    switch ((type || '').toLowerCase()) {
                      case 'payment':
                        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                      case 'contract':
                        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                      case 'message':
                        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200'
                      case 'court':
                        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                      case 'missing':
                        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200'
                      default:
                        return 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200'
                    }
                  })()
                  return (
                    <div key={ev.id || idx} className="relative">
                      <div className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-primary" />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-blue-600">
                          {d ? d.toLocaleDateString() : "Date unknown"}
                        </div>
                        <div className="mt-1 text-base font-medium flex items-center gap-2">
                          {ev.title || 'Event'}
                          {type && (
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${typeStyle}`}>{type}</span>
                          )}
                        </div>
                        {ev.description && <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${confColor}`}>Confidence: {confLabel}</span>
                          {srcDoc && (
                            <a
                              href={`/api/documents/${srcDoc.id}/file`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300 underline"
                              title="Open source file"
                            >
                              Source: {srcDoc.filename || srcDoc.id}
                            </a>
                          )}
                        </div>
                        {relatedParties.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-muted-foreground">Parties involved</summary>
                            <ul className="mt-1 space-y-1 text-xs">
                              {relatedParties.map((p, i) => (
                                <li key={p.id || i}>
                                  <span className="font-medium">{p.name || "Unnamed"}</span>
                                  {p.role && <span className="text-muted-foreground"> — {p.role}</span>}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
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
      </main>
    </div>
  )
}
