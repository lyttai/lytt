import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { decrypt, encrypt } from '@/lib/crypto'
import { limit, originAllowed } from '@/lib/guard'

export const runtime = 'nodejs'
export const maxDuration = 300

const exts = /\.(txt|md|csv|json|ya?ml|xml|html|css|js|jsx|ts|tsx|py|rb|go|rs|java|kt|swift|c|h|cpp|hpp|cs|php|sh|sql|toml|ini|log)$/i, maxFile = 100_000, maxContext = 24_000
const schema = z.object({ chatId: z.uuid().optional(), content: z.string().trim().min(1).max(16_000) })
const fail = (status: number, error: string, headers?: Record<string, string>) => NextResponse.json({ error }, { status, headers })
const cf = (): Record<string, string> => process.env.CF_ACCESS_CLIENT_ID ? { 'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID, 'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET ?? '' } : {}

export async function POST(req: NextRequest) {
  if (!originAllowed(req.headers.get('origin'))) return fail(403, 'Forbidden.')
  if (Number(req.headers.get('content-length') ?? 0) > 200_000) return fail(413, 'That message is too large.')
  const supabase = await createClient(), { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail(401, 'Log in to chat.')
  const form = await req.formData().catch(() => null), file = form?.get('file')
  const p = schema.safeParse({ chatId: form?.get('chatId') || undefined, content: form?.get('content') })
  if (!p.success) return fail(400, 'Write a message under 16,000 characters.')
  if (file && (!(file instanceof File) || !exts.test(file.name) || file.size > maxFile)) return fail(400, 'Attach one text or code file under 100 KB.')
  const text = file instanceof File ? await file.arrayBuffer().then((b) => new TextDecoder('utf-8', { fatal: true }).decode(b)).catch(() => null) : ''
  if (text === null) return fail(400, 'That file is not plain text.')
  if (!(await limit(`chat:${user.id}`, 30, 600))) return fail(429, 'You are sending messages too fast. Wait a few minutes.')
  const content = file instanceof File && text ? `${p.data.content}\n\nAttached file ${file.name.replace(/[^\w.-]/g, '_').slice(0, 100)}:\n\`\`\`\n${text}\n\`\`\`` : p.data.content
  const chat = p.data.chatId ? (await supabase.from('chats').select('id').eq('id', p.data.chatId).maybeSingle()).data : (await supabase.from('chats').insert({ user_id: user.id, title_enc: encrypt(p.data.content.replace(/\s+/g, ' ').slice(0, 80)) }).select('id').single()).data
  if (!chat) return fail(404, 'Chat not found.')
  const headers = { 'x-chat-id': chat.id }
  if ((await supabase.from('messages').insert({ chat_id: chat.id, user_id: user.id, role: 'user', content_enc: encrypt(content) })).error) return fail(500, 'Could not save your message.', headers)
  const { data: rows } = await supabase.from('messages').select('role, content_enc').eq('chat_id', chat.id).order('created_at', { ascending: false }).limit(40)
  const history = (rows ?? []).map((m) => ({ role: m.role, content: decrypt(m.content_enc) })).reduce((a, m) => a.size + m.content.length > maxContext && a.list.length ? { size: Infinity, list: a.list } : { size: a.size + m.content.length, list: [m, ...a.list] }, { size: 0, list: [] as { role: string, content: string }[] }).list
  const upstream = await fetch(`${process.env.OLLAMA_URL}/api/chat`, { method: 'POST', signal: req.signal, headers: { 'content-type': 'application/json', ...cf() }, body: JSON.stringify({ model: process.env.OLLAMA_MODEL ?? 'lytt', messages: history, stream: true, think: false, keep_alive: '30m' }) }).catch((e: Error) => (console.error('ollama unreachable', process.env.OLLAMA_URL ? new URL(process.env.OLLAMA_URL).host : 'OLLAMA_URL missing', e.message, (e.cause as Error)?.message ?? ''), null))
  if (upstream && !upstream.ok) console.error('ollama rejected', upstream.status, upstream.headers.get('server') ?? '', upstream.headers.get('cf-mitigated') ?? '', process.env.CF_ACCESS_CLIENT_ID ? 'token set' : 'token missing', (await upstream.text().catch(() => '')).slice(0, 200))
  if (!upstream?.ok || !upstream.body) return fail(502, 'lytt is offline right now. Try again in a bit.', headers)
  const reader = upstream.body.getReader(), decoder = new TextDecoder(), encoder = new TextEncoder()
  let answer = '', buffer = ''
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (let r = await reader.read(); !r.done; r = await reader.read()) {
          const lines = (buffer + decoder.decode(r.value, { stream: true })).split('\n')
          buffer = lines.pop() ?? ''
          lines.filter((l) => l.trim()).map((l) => JSON.parse(l)?.message?.content ?? '').filter(Boolean).forEach((t: string) => { answer += t; controller.enqueue(encoder.encode(t)) })
        }
      } catch {} finally {
        if (answer.trim()) await supabase.from('messages').insert({ chat_id: chat.id, user_id: user.id, role: 'assistant', content_enc: encrypt(answer) }).then(() => supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chat.id))
        try { controller.close() } catch {}
      }
    },
    cancel() { reader.cancel().catch(() => {}) }
  })
  return new Response(stream, { headers: { ...headers, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } })
}
