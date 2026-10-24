import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Check your email', description: 'Thanks for signing up for lytt. Confirm your email to start chatting.', robots: { index: false }, alternates: { canonical: '/thanks' } }

export default function Page() {
  return (
    <main className="auth">
      <h1>Thanks for signing up</h1>
      <p>We sent a confirmation link to your email. Open it on this device to activate your account and start chatting.</p>
      <p className="muted">Nothing after a few minutes? Check spam, or <Link href="/signup">try again</Link> with the right address.</p>
    </main>
  )
}
