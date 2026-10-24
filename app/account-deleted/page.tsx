import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Account deleted', description: 'Your lytt account and all of its data have been erased.', robots: { index: false }, alternates: { canonical: '/account-deleted' } }

export default function Page() {
  return (
    <main className="auth">
      <h1>Your account is gone</h1>
      <p>Your login, profile, chats and messages have been erased from our database. Thanks for trying lytt.</p>
      <p><Link href="/">Back to the home page</Link></p>
    </main>
  )
}
