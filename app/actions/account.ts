'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/chats'
import { admin } from '@/lib/supabase/admin'
import { clientIp, limit } from '@/lib/guard'
import { email, parse, type FormState } from '@/lib/form'

export async function deleteAccount(_: FormState, form: FormData): Promise<FormState> {
  const p = parse(z.object({ confirm: z.literal('delete', { error: 'Type delete to confirm.' }) }), form)
  if ('state' in p) return p.state
  const { supabase, user } = await requireUser(), db = admin()
  const { error } = await db.auth.admin.deleteUser(user.id)
  if (error) return { error: 'Could not delete the account. Try again, or email us and we will do it by hand.' }
  await db.rpc('purge_user_logs', { p_user: user.id })
  await supabase.auth.signOut({ scope: 'local' })
  redirect('/account-deleted')
}

export async function setMarketing(_: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('profiles').update({ marketing_opt_in: form.get('marketing') === 'on' }).eq('id', user.id)
  revalidatePath('/settings')
  return error ? { error: 'Could not save. Try again.' } : { ok: 'Saved.' }
}

export async function unsubscribe(_: FormState, form: FormData): Promise<FormState> {
  const p = parse(z.object({ email }), form)
  if ('state' in p) return p.state
  if (!(await limit(`unsubscribe:${await clientIp()}`, 10, 3600))) return { error: 'Too many attempts. Wait a few minutes and try again.' }
  await admin().rpc('unsubscribe_email', { p_email: p.data.email })
  return { ok: 'Done. That address will not get product emails from lytt. Account emails like password resets still arrive when you ask for them.' }
}
