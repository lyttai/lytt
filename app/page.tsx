import type { Metadata } from 'next'
import Link from 'next/link'
import { Markdown } from '@/components/Markdown'
import { demo } from '@/lib/demo'

export const metadata: Metadata = { title: { absolute: 'lytt | A private AI assistant on its own hardware' }, description: 'Chat with lytt, an AI assistant for code, writing and questions. It runs on dedicated hardware, keeps chats encrypted, and deletes everything when you ask.', alternates: { canonical: '/' }, openGraph: { title: 'lytt', description: 'A private AI assistant on its own hardware.', url: '/' } }

export default function Page() {
  return (
    <main className="wrap">
      <section className="hero">
        <div>
          <h1>Ask lytt. Get a straight answer.</h1>
          <p className="lead">lytt is an AI assistant for code, writing and everyday questions. It runs on one dedicated machine, and your chats are encrypted before they are stored.</p>
          <div className="actions"><Link href="/signup" className="button">Start chatting</Link><Link href="/login" className="button ghost">Log in</Link></div>
        </div>
        <figure className="demo" aria-label="A real conversation with lytt">
          <header><span>A real exchange with lytt</span><span>unedited</span></header>
          <div className="messages">
            <div className="msg user"><div className="who">you</div><div className="body">{demo.question}</div></div>
            <div className="msg assistant"><div className="who">lytt</div><Markdown text={demo.answer} /></div>
          </div>
        </figure>
      </section>
      <section className="facts" aria-labelledby="facts">
        <h2 id="facts">How lytt handles your data</h2>
        <dl>
          <dt>Where it runs</dt><dd>The model runs on lytt&apos;s own computer. Requests reach it through an access-controlled Cloudflare Tunnel that only this website&apos;s server can use.</dd>
          <dt>What is stored</dt><dd>Your email, a hashed password, and your chats. Chat text and titles are encrypted with AES-256 before they hit the database.</dd>
          <dt>What is not</dt><dd>No ads, no analytics, no tracking cookies, and your date of birth is checked once and thrown away.</dd>
          <dt>Leaving</dt><dd>Settings has a delete button. It erases your login, profile, chats and messages right away.</dd>
        </dl>
        <p className="muted">Full details are in the <Link href="/privacy">privacy policy</Link>.</p>
      </section>
      <div className="mobile-cta"><Link href="/signup" className="button">Start chatting</Link></div>
    </main>
  )
}
