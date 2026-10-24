'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { clientIp, limit } from '@/lib/guard'
import { captcha, email, parse, password, safeNext, type FormState } from '@/lib/form'
import { site } from '@/lib/site'

const busy: FormState = { error: 'Too many attempts. Wait a few minutes and try again.' }
const age = (d: string) => { const b = new Date(`${d}T00:00:00Z`), n = new Date(); return n.getUTCFullYear() - b.getUTCFullYear() - (n.getUTCMonth() * 100 + n.getUTCDate() < b.getUTCMonth() * 100 + b.getUTCDate() ? 1 : 0) }
const birthdate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Enter your date of birth.' }).refine((d) => !isNaN(Date.parse(d)) && age(d) <= 120 && age(d) >= 0, { error: 'Enter a real date of birth.' }).refine((d) => age(d) >= site.minAge, { error: `You need to be ${site.minAge} or older to use lytt.` })

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const p = parse(z.object({ email, password, birthdate, terms: z.literal('on', { error: 'You need to accept the terms and privacy policy.' }), 'cf-turnstile-response': captcha }), form)
  if ('state' in p) return p.state
  if (!(await limit(`signup:${await clientIp()}`, 5, 3600))) return busy
  const { error } = await (await createClient()).auth.signUp({ email: p.data.email, password: p.data.password, options: { emailRedirectTo: `${site.url}/auth/confirm?next=/chat`, captchaToken: p.data['cf-turnstile-response'], data: { age_confirmed: true } } })
  if (error) return { error: error.code === 'weak_password' ? 'Pick a stronger password.' : error.code === 'captcha_failed' ? 'The bot check failed. Try again.' : 'Could not create the account. Try again.', values: { email: p.data.email, birthdate: p.data.birthdate } }
  redirect('/thanks')
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const p = parse(z.object({ email, password: z.string().min(1, { error: 'Enter your password.' }).max(72), next: z.string().max(200).optional(), 'cf-turnstile-response': captcha }), form)
  if ('state' in p) return p.state
  const ip = await clientIp()
  if (!(await limit(`login:${ip}`, 20, 900)) || !(await limit(`login:${ip}:${p.data.email}`, 5, 900))) return busy
  const { error } = await (await createClient()).auth.signInWithPassword({ email: p.data.email, password: p.data.password, options: { captchaToken: p.data['cf-turnstile-response'] } })
  if (error) return { error: error.code === 'email_not_confirmed' ? 'Confirm your email first. Check your inbox for the link.' : error.code === 'captcha_failed' ? 'The bot check failed. Try again.' : 'That email and password do not match.', values: { email: p.data.email } }
  redirect(safeNext(p.data.next))
}

export async function forgot(_: FormState, form: FormData): Promise<FormState> {
  const p = parse(z.object({ email, 'cf-turnstile-response': captcha }), form)
  if ('state' in p) return p.state
  if (!(await limit(`forgot:${await clientIp()}`, 5, 3600)) || !(await limit(`forgot:${p.data.email}`, 3, 3600))) return busy
  await (await createClient()).auth.resetPasswordForEmail(p.data.email, { redirectTo: `${site.url}/auth/confirm?next=/reset-password`, captchaToken: p.data['cf-turnstile-response'] })
  return { ok: 'If an account exists for that email, a reset link is on its way. It expires in one hour.' }
}

export async function reset(_: FormState, form: FormData): Promise<FormState> {
  const p = parse(z.object({ password, confirm: z.string() }).refine((d) => d.password === d.confirm, { path: ['confirm'], error: 'Passwords do not match.' }), form)
  if ('state' in p) return p.state
  const supabase = await createClient(), { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/login')
  const { error } = await supabase.auth.updateUser({ password: p.data.password })
  if (error) return { error: error.code === 'same_password' ? 'Pick a password you have not used here before.' : 'Could not update the password. Request a new link and try again.' }
  redirect('/chat')
}

export async function logout() {
  await (await createClient()).auth.signOut()
  redirect('/')
}
