import type { Metadata } from 'next'
import { Form } from '@/components/Form'
import { requireUser } from '@/lib/chats'
import { deleteAccount, setMarketing } from '@/app/actions/account'
import { reset } from '@/app/actions/auth'

export const metadata: Metadata = { title: 'Settings', description: 'Manage your lytt account, email preferences and data.', robots: { index: false }, alternates: { canonical: '/settings' } }

export default async function Page() {
  const { supabase, user } = await requireUser(), { data: profile } = await supabase.from('profiles').select('marketing_opt_in').eq('id', user.id).maybeSingle()
  return (
    <main className="doc settings">
      <h1>Settings</h1>
      <section>
        <h2>Account</h2>
        <p>Signed in as <strong>{user.email}</strong>.</p>
      </section>
      <section>
        <h2>Change password</h2>
        <Form action={reset} submit="Save password" fields={[{ name: 'password', label: 'New password', type: 'password', autoComplete: 'new-password', hint: 'At least 10 characters.', max: 72 }, { name: 'confirm', label: 'Repeat new password', type: 'password', autoComplete: 'new-password', max: 72 }]} />
      </section>
      <section>
        <h2>Email</h2>
        <p className="muted">Account emails, like confirmation and password reset links, are only sent when you ask for them. Product emails are off unless you turn them on.</p>
        <Form action={setMarketing} submit="Save email preferences" fields={[{ name: 'marketing', type: 'checkbox', label: 'Send me occasional product updates about lytt.', checked: !!profile?.marketing_opt_in }]} />
      </section>
      <section>
        <h2>Delete account</h2>
        <p>This permanently erases your login, your profile, every chat and message, and the auth logs tied to your account. It cannot be undone.</p>
        <Form action={deleteAccount} submit="Delete my account" danger fields={[{ name: 'confirm', label: 'Type delete to confirm', autoComplete: 'off', max: 10 }]} />
      </section>
    </main>
  )
}
