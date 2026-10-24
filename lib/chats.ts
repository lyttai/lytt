import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { decrypt } from './crypto'

export async function requireUser() {
  const supabase = await createClient(), { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/login')
  return { supabase, user: data.user }
}

export async function listChats() {
  const { supabase } = await requireUser(), { data } = await supabase.from('chats').select('id, title_enc').order('updated_at', { ascending: false }).limit(100)
  return (data ?? []).map((c) => ({ id: c.id, title: decrypt(c.title_enc) }))
}

export async function getChat(id: string) {
  const { supabase } = await requireUser(), { data: chat } = await supabase.from('chats').select('id, title_enc').eq('id', id).maybeSingle()
  if (!chat) return null
  const { data } = await supabase.from('messages').select('role, content_enc').eq('chat_id', id).order('created_at').limit(500)
  return { id: chat.id, title: decrypt(chat.title_enc), messages: (data ?? []).map((m) => ({ role: m.role as 'user' | 'assistant', content: decrypt(m.content_enc) })) }
}
