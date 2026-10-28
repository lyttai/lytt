import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

export const dynamic = 'force-static'

export async function GET() {
  const html = (await readFile(join(process.cwd(), 'app/arlenshouse/arlens-house.html'), 'utf8')).replace(/\r\n?/g, '\n')
  const hashes = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`).join(' ')
  const csp = [`default-src 'self'`, `script-src ${hashes} https://cdn.jsdelivr.net`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob:`, `connect-src 'self'`, `font-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `frame-ancestors 'none'`, 'upgrade-insecure-requests'].join('; ')
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': csp, 'x-robots-tag': 'noindex, nofollow' } })
}
