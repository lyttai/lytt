import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }

export async function createClient() {
  const store = await cookies()
  return createServerClient(supabaseUrl, supabaseKey, { cookieOptions, cookies: { getAll: () => store.getAll(), setAll: (list) => list.forEach(({ name, value, options }) => { try { store.set(name, value, { ...options, ...cookieOptions }) } catch {} }) } })
}

export async function getUser() {
  const { data } = await (await createClient()).auth.getUser()
  return data.user
}
