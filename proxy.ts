import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookieOptions, supabaseKey, supabaseUrl } from './lib/supabase/config'

const privatePaths = ['/chat', '/settings', '/reset-password'], guestPaths = ['/login', '/signup', '/forgot-password']

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64'), dev = process.env.NODE_ENV === 'development', path = request.nextUrl.pathname
  const csp = [`default-src 'self'`, `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob:`, `font-src 'self'`, `connect-src 'self'`, `frame-src https://challenges.cloudflare.com`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, ...(dev ? [] : ['upgrade-insecure-requests'])].join('; ')
  const headers = new Headers(request.headers)
  headers.set('x-nonce', nonce)
  headers.set('content-security-policy', csp)
  let response = NextResponse.next({ request: { headers } })
  const supabase = createServerClient(supabaseUrl, supabaseKey, { cookieOptions, cookies: { getAll: () => request.cookies.getAll(), setAll: (list) => { list.forEach(({ name, value }) => request.cookies.set(name, value)); headers.set('cookie', request.cookies.toString()); response = NextResponse.next({ request: { headers } }); list.forEach(({ name, value, options }) => response.cookies.set(name, value, { ...options, ...cookieOptions })) } } })
  const { data } = await supabase.auth.getUser()
  const to = !data.user && privatePaths.some((p) => path.startsWith(p)) ? `/login?next=${encodeURIComponent(path)}` : data.user && guestPaths.includes(path) ? '/chat' : null
  if (to) { const r = NextResponse.redirect(new URL(to, request.url)); response.cookies.getAll().forEach((c) => r.cookies.set(c)); response = r }
  response.headers.set('content-security-policy', csp)
  return response
}

export const config = { matcher: [{ source: '/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|llms.txt).*)', missing: [{ type: 'header', key: 'next-router-prefetch' }, { type: 'header', key: 'purpose', value: 'prefetch' }] }] }
