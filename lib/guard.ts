import 'server-only'
import { headers } from 'next/headers'
import { admin } from './supabase/admin'
import { hash } from './crypto'

export const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',').map((o) => o.trim())

export const originAllowed = (origin: string | null) => !!origin && allowedOrigins.includes(origin)

export const clientIp = async () => (await headers()).get('x-real-ip') ?? (await headers()).get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

export async function limit(key: string, max: number, seconds: number) {
  const { data, error } = await admin().rpc('hit_rate_limit', { p_key: key.startsWith('chat:') ? key : hash(key), p_max: max, p_seconds: seconds })
  return !error && data === true
}
