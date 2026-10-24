import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Form } from '@/components/Form'
import { reset } from '@/app/actions/auth'
import { getUser } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Choose a new password', description: 'Set a new password for your lytt account.', robots: { index: false }, alternates: { canonical: '/reset-password' } }

export default async function Page() {
  if (!(await getUser())) redirect('/login?next=/reset-password')
  return (
    <main className="auth">
      <h1>Choose a new password</h1>
      <Form action={reset} submit="Save password" fields={[{ name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password', hint: 'At least 10 characters.', max: 72 }, { name: 'confirm', label: 'Repeat new password', type: 'password', autoComplete: 'new-password', max: 72 }]} />
    </main>
  )
}
