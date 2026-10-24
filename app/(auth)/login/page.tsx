import type { Metadata } from 'next'
import Link from 'next/link'
import { Form } from '@/components/Form'
import { login } from '@/app/actions/auth'
import { safeNext } from '@/lib/form'

export const metadata: Metadata = { title: 'Log in', description: 'Log in to lytt to pick up your conversations where you left them.', alternates: { canonical: '/login' } }

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string, error?: string }> }) {
  const { next, error } = await searchParams
  return (
    <main className="auth">
      <h1>Log in</h1>
      {error === 'link' && <p className="form-error" role="alert">That link is invalid or expired. Log in or request a new one.</p>}
      <Form action={login} submit="Log in" captcha hidden={{ next: safeNext(next) }} fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email', max: 254 }, { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password', max: 72 }]} />
      <p className="aside"><Link href="/forgot-password">Forgot password?</Link><Link href="/signup">Create an account</Link></p>
    </main>
  )
}
