"use client"

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

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-border bg-card px-6">
      {/* Case Selector (kept). Search, notifications and profile removed per request. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <span className="max-w-[200px] truncate">Smith vs. Johnson Corp</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Select Case</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {cases.map((c) => (
            <DropdownMenuItem key={c.id} className="flex flex-col items-start">
              <span className="font-medium">{c.title}</span>
              <span className="text-xs text-muted-foreground">{c.id}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
