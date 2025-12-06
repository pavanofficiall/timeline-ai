"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, LayoutGrid, List } from "lucide-react"
import { useState } from "react"

export function EvidenceFilters() {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search evidence..." className="pl-10" />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border p-1">
        <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setView("grid")}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}>
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
