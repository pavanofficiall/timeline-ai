import { ChatSidebar } from "@/components/ai-chat/chat-sidebar"
import { ChatInterface } from "@/components/ai-chat/chat-interface"

export default function AIChatPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <ChatSidebar />
      <ChatInterface />
    </div>
  )
}
