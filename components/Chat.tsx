'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Markdown } from './Markdown'

type Msg = { role: 'user' | 'assistant', content: string }
const exts = /\.(txt|md|csv|json|ya?ml|xml|html|css|js|jsx|ts|tsx|py|rb|go|rs|java|kt|swift|c|h|cpp|hpp|cs|php|sh|sql|toml|ini|log)$/i

export function Chat({ chatId, title, initial }: { chatId?: string, title: string, initial: Msg[] }) {
  const [messages, setMessages] = useState(initial), [text, setText] = useState(''), [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const id = useRef(chatId), abort = useRef<AbortController | null>(null), fileInput = useRef<HTMLInputElement>(null), router = useRouter()
  useEffect(() => { if (innerHeight + scrollY > document.documentElement.scrollHeight - 240) scrollTo({ top: document.documentElement.scrollHeight }) }, [messages])
  const pick = (f?: File) => { setError(''); if (f && (!exts.test(f.name) || f.size > 100_000)) { setError('Attach one text or code file under 100 KB.'); if (fileInput.current) fileInput.current.value = ''; return } setFile(f ?? null) }
  const update = (t: string) => setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content: m[m.length - 1].content + t }])

  async function send(e?: FormEvent) {
    e?.preventDefault()
    const content = text.trim()
    if (!content || busy) return
    if (content.length > 16_000) return setError('Keep messages under 16,000 characters.')
    const body = new FormData()
    body.set('content', content)
    if (id.current) body.set('chatId', id.current)
    if (file) body.set('file', file)
    setError(''); setBusy(true); setText(''); setFile(null)
    if (fileInput.current) fileInput.current.value = ''
    setMessages((m) => [...m, { role: 'user', content: file ? `${content}\n\n[attached ${file.name}]` : content }, { role: 'assistant', content: '' }])
    abort.current = new AbortController()
    const res = await fetch('/api/chat', { method: 'POST', body, signal: abort.current.signal }).catch(() => null), newId = res?.headers.get('x-chat-id')
    if (newId && !id.current) { id.current = newId; history.replaceState(null, '', `/chat/${newId}`) }
    if (!res?.ok || !res.body) { const msg = res ? (await res.json().catch(() => null))?.error : null; setMessages((m) => m.slice(0, -1)); setError(msg ?? 'Could not reach lytt. Try again.'); setBusy(false); if (newId) router.refresh(); return }
    const reader = res.body.getReader(), decoder = new TextDecoder()
    for (let r = await reader.read().catch(() => null); r && !r.done; r = await reader.read().catch(() => null)) update(decoder.decode(r.value, { stream: true }))
    setBusy(false)
    router.refresh()
  }

  const keys = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) send(e) }

  return (
    <main className="chat">
      <h1>{title}</h1>
      <div className="messages" aria-live="polite">
        {!messages.length && <p className="muted">Ask lytt anything. You can attach one text or code file up to 100 KB. Press Enter to send, Shift and Enter for a new line.</p>}
        {messages.map((m, i) => <div key={i} className={`msg ${m.role}`}><div className="who">{m.role === 'user' ? 'you' : 'lytt'}</div>{m.role === 'user' ? <div className="body">{m.content}</div> : m.content ? <Markdown text={m.content} /> : <p className="muted">Thinking...</p>}</div>)}
      </div>
      <form className="composer" onSubmit={send}>
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea id="message" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={keys} placeholder="Message lytt" maxLength={16_000} rows={2} aria-invalid={!!error} aria-describedby={error ? 'composer-error' : undefined} />
        <div className="row">
          <label className="attach" htmlFor="file">Attach file</label>
          <input id="file" ref={fileInput} type="file" accept=".txt,.md,.csv,.json,.yaml,.yml,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.rb,.go,.rs,.java,.kt,.swift,.c,.h,.cpp,.hpp,.cs,.php,.sh,.sql,.toml,.ini,.log" onChange={(e) => pick(e.target.files?.[0])} />
          {file && <span className="file">{file.name} <button type="button" className="link-button" onClick={() => pick()}>remove</button></span>}
          {error && <span id="composer-error" className="err" role="alert">{error}</span>}
          <span className="spacer" />
          {busy ? <button type="button" className="button ghost small" onClick={() => abort.current?.abort()}>Stop</button> : <button className="button small" disabled={!text.trim()}>Send</button>}
        </div>
      </form>
    </main>
  )
}
