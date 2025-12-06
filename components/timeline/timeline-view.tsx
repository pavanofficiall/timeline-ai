"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, FileText, MessageSquare, DollarSign, Users, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const events = [
  {
    id: 1,
    date: "Dec 5, 2024",
    time: "2:30 PM",
    title: "Contract Signed",
    description: "Service agreement signed between Smith and Johnson Corp for IT consulting services.",
    tag: "Contract",
    parties: ["Robert Smith", "Johnson Corp"],
    payment: null,
    sourceDoc: "agreement.pdf",
    confidence: 95,
  },
  {
    id: 2,
    date: "Dec 3, 2024",
    time: "11:00 AM",
    title: "Initial Payment Received",
    description: "First installment payment received as per contract terms.",
    tag: "Payment",
    parties: ["Robert Smith"],
    payment: { amount: "$25,000", from: "Johnson Corp", to: "Robert Smith" },
    sourceDoc: "invoice-march.pdf",
    confidence: 88,
  },
  {
    id: 3,
    date: "Nov 28, 2024",
    time: "4:15 PM",
    title: "WhatsApp Discussion",
    description: "Discussion about project scope and deliverables between parties.",
    tag: "Message",
    parties: ["Robert Smith", "John Johnson"],
    payment: null,
    sourceDoc: "whatsapp-export.pdf",
    confidence: 72,
  },
  {
    id: 4,
    date: "Nov 20, 2024",
    time: "10:00 AM",
    title: "Meeting at Office",
    description: "Initial meeting to discuss project requirements and timeline.",
    tag: "Meeting",
    parties: ["Robert Smith", "John Johnson", "Sarah Lee"],
    payment: null,
    sourceDoc: null,
    confidence: 85,
  },
]

const tagColors: Record<string, string> = {
  Contract: "bg-primary/10 text-primary",
  Payment: "bg-success/10 text-success",
  Message: "bg-chart-2/10 text-chart-2",
  Meeting: "bg-warning/10 text-warning",
}

const tagIcons: Record<string, React.ElementType> = {
  Contract: FileText,
  Payment: DollarSign,
  Message: MessageSquare,
  Meeting: Calendar,
}

export function TimelineView() {
  const [expandedId, setExpandedId] = useState<number | null>(1)

  return (
    <div className="relative space-y-4 pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 h-full w-0.5 bg-border" />

      {events.map((event) => {
        const isExpanded = expandedId === event.id
        const TagIcon = tagIcons[event.tag] || FileText

        return (
          <div key={event.id} className="relative">
            {/* Circle marker */}
            <div
              className={cn(
                "absolute -left-5 top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card",
                isExpanded ? "bg-primary" : "bg-muted",
              )}
            />

            <Card
              className={cn(
                "cursor-pointer border-border bg-card transition-shadow hover:shadow-md",
                isExpanded && "ring-1 ring-primary",
              )}
              onClick={() => setExpandedId(isExpanded ? null : event.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("gap-1", tagColors[event.tag])}>
                        <TagIcon className="h-3 w-3" />
                        {event.tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <h3 className="font-medium text-card-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Confidence */}
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Confidence</div>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full",
                              event.confidence >= 80
                                ? "bg-success"
                                : event.confidence >= 60
                                  ? "bg-warning"
                                  : "bg-destructive",
                            )}
                            style={{ width: `${event.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-card-foreground">{event.confidence}%</span>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-3">
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Parties Involved
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.parties.map((party) => (
                          <Badge key={party} variant="secondary" className="text-xs">
                            {party}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {event.payment && (
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Payment Info
                        </div>
                        <p className="text-sm font-medium text-card-foreground">{event.payment.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.payment.from} → {event.payment.to}
                        </p>
                      </div>
                    )}

                    {event.sourceDoc && (
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          Source Document
                        </div>
                        <Button variant="link" className="h-auto p-0 text-sm text-primary">
                          {event.sourceDoc}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
