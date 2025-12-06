"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Search, Plus, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const chats = [
  { id: 1, title: "Contract analysis", date: "Today", saved: true },
  { id: 2, title: "Payment timeline query", date: "Today", saved: false },
  { id: 3, title: "Legal precedents search", date: "Yesterday", saved: true },
  { id: 4, title: "Draft review assistance", date: "Yesterday", saved: false },
  { id: 5, title: "Evidence evaluation", date: "Dec 3", saved: false },
]

export function ChatSidebar() {
  const [activeChat, setActiveChat] = useState(1)

  return (
    <Card className="w-72 shrink-0 border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-card-foreground">Conversations</CardTitle>
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search chats..." className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setActiveChat(chat.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
              activeChat === chat.id ? "bg-accent text-accent-foreground" : "hover:bg-muted",
            )}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{chat.title}</p>
              <p className="text-xs text-muted-foreground">{chat.date}</p>
            </div>
            {chat.saved && <Star className="h-3 w-3 text-warning" />}
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
