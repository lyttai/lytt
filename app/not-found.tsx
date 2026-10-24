import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Page not found', description: 'This page does not exist on lytt.', robots: { index: false } }

export default function NotFound() {
  return (
    <main className="auth">
      <p className="big" aria-hidden="true">404</p>
      <h1>Page not found</h1>
      <p>The link may be old, or the chat may have been deleted.</p>
      <p><Link href="/" className="button">Go home</Link></p>
    </main>
  )
}
