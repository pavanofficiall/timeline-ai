"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type Doc = { id: string; filename: string; uploaded_at?: string; status?: string }
type Event = { id?: string; date?: string; title?: string; description?: string; confidence_score?: number }

export default function CaseWorkspacePage() {
  const params = useParams<{ id: string }>()
  const caseId = params?.id as string
  const [docs, setDocs] = useState<Doc[]>([])
  const [timeline, setTimeline] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append("file", f)
      const res = await fetch(`/api/cases/${caseId}/upload`, { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `Upload failed (${res.status})`)
      await load()
    } catch (e: any) {
      setError(e?.message || "Upload failed")
    } finally {
      setUploading(false)
      e.currentTarget.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Case Workspace</h1>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>

      {/* Upload */}
      <Card className="border">
        <div className="p-4">
        <label className="text-sm font-medium mb-2 block">Upload a document (PDF/PNG/JPG)</label>
        <div className="flex items-center gap-3">
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={onUpload} disabled={uploading} />
          <Button disabled className="gap-2" variant="secondary">
            {uploading ? <Spinner className="h-4 w-4" /> : null}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
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
      </div>
    </div>
  )
}
