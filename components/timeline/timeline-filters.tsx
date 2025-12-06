"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, ArrowUpDown } from "lucide-react"

export function TimelineFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-10" />
      </div>

      <Select defaultValue="all">
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
          <SelectItem value="payment">Payment</SelectItem>
          <SelectItem value="message">Message</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" className="gap-2 bg-transparent">
        <Calendar className="h-4 w-4" />
        Date Range
      </Button>

      <Button variant="outline" className="gap-2 bg-transparent">
        <ArrowUpDown className="h-4 w-4" />
        Newest First
      </Button>
    </div>
  )
}
