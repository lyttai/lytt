import type { Metadata } from 'next'
import Link from 'next/link'
import { Form } from '@/components/Form'
import { signup } from '@/app/actions/auth'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Create an account', description: `Create a free lytt account. You need to be ${site.minAge} or older.`, alternates: { canonical: '/signup' } }

export default function Page() {
  return (
    <main className="auth">
      <h1>Create an account</h1>
      <Form action={signup} submit="Create account" captcha fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', max: 254 },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password', hint: 'At least 10 characters.', max: 72 },
        { name: 'birthdate', label: 'Date of birth', type: 'date', autoComplete: 'bday', hint: `Used once to check you are ${site.minAge} or older. We do not store it.` },
        { name: 'terms', type: 'checkbox', label: <>I agree to the <Link href="/terms">terms</Link> and have read the <Link href="/privacy">privacy policy</Link>.</> }
      ]} />
      <p className="aside">Already have an account? <Link href="/login">Log in</Link></p>
    </main>
  )
}
