import type { Metadata } from 'next'
import Link from 'next/link'
import { Form } from '@/components/Form'
import { forgot } from '@/app/actions/auth'

export const metadata: Metadata = { title: 'Reset your password', description: 'Get a link to reset the password for your lytt account.', alternates: { canonical: '/forgot-password' } }

export default function Page() {
  return (
    <main className="auth">
      <h1>Reset your password</h1>
      <p className="muted">Enter the email you signed up with and we will send you a reset link.</p>
      <Form action={forgot} submit="Send reset link" captcha fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email', max: 254 }]} />
      <p className="aside"><Link href="/login">Back to log in</Link></p>
    </main>
  )
}
