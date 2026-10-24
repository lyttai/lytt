'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { deleteChat } from '@/app/actions/chat'

export function ChatList({ chats }: { chats: { id: string, title: string }[] }) {
  const path = usePathname()
  return (
    <>
      <Link href="/chat" className="button small">New chat</Link>
      {chats.length ? <ul>{chats.map((c) => <li key={c.id}><Link href={`/chat/${c.id}`} aria-current={path === `/chat/${c.id}` ? 'page' : undefined} title={c.title}>{c.title}</Link><form action={deleteChat}><input type="hidden" name="id" value={c.id} /><button aria-label={`Delete chat ${c.title}`} title="Delete chat">Delete</button></form></li>)}</ul> : <p className="empty">No chats yet.</p>}
    </>
  )
}
