"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const cases = [
  { id: "CASE-001", title: "Smith vs. Johnson Corp" },
  { id: "CASE-002", title: "Estate of Williams" },
  { id: "CASE-003", title: "Tech Solutions Ltd Dispute" },
]

type CaseRow = { id: string; title?: string | null }

export function TopNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [cases, setCases] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/cases")
        const json = await res.json().catch(() => ({}))
        if (!mounted) return
        if (res.ok && Array.isArray(json?.cases)) setCases(json.cases as CaseRow[])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const activeCaseId = useMemo(() => {
    // Match /cases/:id
    if (!pathname) return null
    const parts = pathname.split("/").filter(Boolean)
    const idx = parts.indexOf("cases")
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null
  }, [pathname])

  const activeTitle = useMemo(() => {
    if (!activeCaseId) return null
    const row = cases.find((c) => c.id === activeCaseId)
    return row?.title || null
  }, [activeCaseId, cases])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end border-b border-border bg-card px-6">
      {/* Case Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <span className="max-w-[260px] truncate">
              {activeTitle || (loading ? "Loading cases…" : "Select case")}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Cases</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(cases || []).slice(0, 3).map((c) => (
            <DropdownMenuItem
              key={c.id}
              className="flex items-start"
              onClick={() => router.push(`/cases/${c.id}`)}
            >
              <span className="font-medium">{c.title || "Untitled"}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/cases")}>
            View all
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
