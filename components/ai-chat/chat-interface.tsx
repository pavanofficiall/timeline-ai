"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Paperclip, Scale, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  citations?: string[]
  suggestions?: string[]
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "user",
    content: "What are the key points from the service agreement?",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "Based on my analysis of the service agreement (agreement.pdf), here are the key points:\n\n• **Service Scope**: IT consulting services for enterprise software implementation\n• **Duration**: 12 months from October 1, 2024\n• **Payment Terms**: $75,000 total, payable in three installments\n• **Termination Clause**: Either party may terminate with 30 days written notice\n• **Liability Cap**: Limited to the total contract value",
    citations: ["agreement.pdf - Section 2.1", "agreement.pdf - Section 4.2"],
    suggestions: [
      "Analyze payment schedule compliance",
      "Review termination conditions",
      "Check for breach indicators",
    ],
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
    }
    setMessages([...messages, newMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content:
            "I understand your question. Let me analyze the relevant documents and provide you with a comprehensive answer...",
        },
      ])
    }, 2000)
  }

  return (
    <Card className="flex flex-1 flex-col border-border bg-card">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-card-foreground">
          <Scale className="h-4 w-4 text-primary" />
          Contract Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Scale className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "max-w-[80%] space-y-2 rounded-lg p-3",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-card-foreground",
              )}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>

              {message.citations && (
                <div className="space-y-1 border-t border-border/50 pt-2">
                  <p className="text-xs font-medium opacity-70">Citations:</p>
                  {message.citations.map((citation, i) => (
                    <p key={i} className="text-xs opacity-70">
                      • {citation}
                    </p>
                  ))}
                </div>
              )}

              {message.suggestions && (
                <div className="flex flex-wrap gap-1 border-t border-border/50 pt-2">
                  {message.suggestions.map((suggestion, i) => (
                    <Button key={i} variant="secondary" size="sm" className="h-7 text-xs">
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {message.role === "user" && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Scale className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Analyzing documents...</span>
            </div>
          </div>
        )}
      </CardContent>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Ask about your case..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
