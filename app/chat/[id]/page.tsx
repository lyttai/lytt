import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { Chat } from '@/components/Chat'
import { getChat } from '@/lib/chats'

type Props = { params: Promise<{ id: string }> }
const load = async (id: string) => z.uuid().safeParse(id).success ? getChat(id) : null

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chat = await load((await params).id)
  return { title: chat ? `Chat: ${chat.title.slice(0, 50)}` : 'Chat not found', description: 'A private conversation with lytt.', robots: { index: false } }
}

export default async function Page({ params }: Props) {
  const chat = await load((await params).id)
  if (!chat) notFound()
  return <Chat key={chat.id} chatId={chat.id} title={chat.title} initial={chat.messages} />
}
