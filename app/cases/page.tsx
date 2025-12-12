"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

type CaseRow = { id: string; title: string; lawyer_id?: string | null; created_at?: string }

export default function CasesPage() {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/cases")
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `Failed (${res.status})`)
      setCases(json?.cases || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load cases")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `Failed (${res.status})`)
      setTitle("")
      await load()
    } catch (e: any) {
      setError(e?.message || "Failed to create case")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Cases</h1>
          <p className="text-sm text-muted-foreground">Create a new case or open an existing one.</p>
        </div>

        <Card className="p-4">
          <form onSubmit={onCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="title">Case title</Label>
              <Input id="title" placeholder="e.g., Smith vs. Johnson Corp" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <Button type="submit" disabled={!title.trim() || submitting} className="min-w-[120px]">
              {submitting ? <Spinner className="h-4 w-4" /> : "Create"}
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </Card>

        <Card>
          <div className="border-b p-3 font-medium">Existing cases</div>
          <div className="p-3">
            {loading ? (
              <div className="text-sm text-muted-foreground flex items-center gap-2"><Spinner /> Loading…</div>
            ) : cases.length ? (
              <div className="divide-y">
                {cases.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/cases/${c.id}`} className="text-blue-600 underline">Open</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No cases yet. Create one above.</div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}

