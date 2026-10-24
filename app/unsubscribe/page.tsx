import type { Metadata } from 'next'
import { Form } from '@/components/Form'
import { unsubscribe } from '@/app/actions/account'

export const metadata: Metadata = { title: 'Unsubscribe', description: 'Stop product emails from lytt for any address.', alternates: { canonical: '/unsubscribe' } }

export default function Page() {
  return (
    <main className="auth">
      <h1>Unsubscribe</h1>
      <p className="muted">Enter your email to stop product emails from lytt. You will still get account emails you ask for, like password reset links.</p>
      <Form action={unsubscribe} submit="Unsubscribe" fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email', max: 254 }]} />
    </main>
  )
}
