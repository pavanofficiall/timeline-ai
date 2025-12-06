"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Clock } from "lucide-react"

const notes = [
  {
    author: "John Doe",
    avatar: "JD",
    content: "Client mentioned additional documents from April 2024 that might support our case. Need to follow up.",
    date: "Dec 5, 2024 at 3:45 PM",
  },
  {
    author: "John Doe",
    avatar: "JD",
    content: "Reviewed contract terms - Section 4.2 explicitly states payment terms. This is crucial for our argument.",
    date: "Dec 3, 2024 at 11:30 AM",
  },
  {
    author: "John Doe",
    avatar: "JD",
    content: "Initial case assessment completed. Strong position for the plaintiff.",
    date: "Nov 28, 2024 at 2:15 PM",
  },
]

export function CaseNotes() {
  const [newNote, setNewNote] = useState("")

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Write your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">Previous Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes.map((note, i) => (
            <div key={i} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{note.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{note.author}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {note.date}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-card-foreground">{note.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
