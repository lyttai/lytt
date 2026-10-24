'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export async function deleteChat(form: FormData) {
  const id = z.uuid().safeParse(form.get('id'))
  if (id.success) await (await createClient()).from('chats').delete().eq('id', id.data)
  redirect('/chat')
}
