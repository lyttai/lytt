import type { Metadata } from 'next'
import { Chat } from '@/components/Chat'

export const metadata: Metadata = { title: 'New chat', description: 'Start a new conversation with lytt.', robots: { index: false }, alternates: { canonical: '/chat' } }

export default function Page() {
  return <Chat title="New chat" initial={[]} />
}
