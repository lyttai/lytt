import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/form'

const types = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams, token = q.get('token_hash'), type = q.get('type'), code = q.get('code'), supabase = await createClient()
  const ok = token && type && types.includes(type) ? !(await supabase.auth.verifyOtp({ token_hash: token, type: type as EmailOtpType })).error : code ? !(await supabase.auth.exchangeCodeForSession(code)).error : false
  return NextResponse.redirect(new URL(ok ? safeNext(type === 'recovery' ? '/reset-password' : q.get('next') ?? '/chat') : '/login?error=link', request.url))
}
