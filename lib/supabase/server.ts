import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { cookieOptions, supabaseKey, supabaseUrl } from './config'

export async function createClient() {
  const store = await cookies()
  return createServerClient(supabaseUrl, supabaseKey, { cookieOptions, cookies: { getAll: () => store.getAll(), setAll: (list) => list.forEach(({ name, value, options }) => { try { store.set(name, value, { ...options, ...cookieOptions }) } catch {} }) } })
}

export async function getUser() {
  const { data } = await (await createClient()).auth.getUser()
  return data.user
}
