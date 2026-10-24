import { ChatList } from '@/components/ChatList'
import { listChats } from '@/lib/chats'

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const chats = await listChats()
  return (
    <div className="chat-shell">
      <nav className="sidebar chats" aria-label="Chats"><ChatList chats={chats} /></nav>
      <details className="sidebar-mobile chats"><summary>Your chats ({chats.length})</summary><ChatList chats={chats} /></details>
      {children}
    </div>
  )
}
