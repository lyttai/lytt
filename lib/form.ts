import { z } from 'zod'

export type FormState = { error?: string, ok?: string, fields?: Record<string, string[] | undefined>, values?: Record<string, string> }

export const email = z.string().trim().toLowerCase().pipe(z.email({ error: 'Enter a valid email address.' }).max(254, { error: 'That email is too long.' }))
export const password = z.string().min(10, { error: 'Use at least 10 characters.' }).max(72, { error: 'Use 72 characters or fewer.' })
export const captcha = z.string().max(4096).optional()

export function parse<T extends z.ZodType>(schema: T, data: FormData): { data: z.infer<T> } | { state: FormState } {
  const raw = Object.fromEntries([...data.entries()].filter(([k, v]) => typeof v === 'string' && !k.startsWith('$'))) as Record<string, string>, r = schema.safeParse(raw)
  const values = Object.fromEntries(Object.entries(raw).filter(([k]) => !/password|confirm|cf-turnstile/.test(k)))
  return r.success ? { data: r.data } : { state: { error: 'Fix the highlighted fields.', fields: z.flattenError(r.error).fieldErrors as Record<string, string[]>, values } }
}

export const safeNext = (next?: string) => next && /^\/(?![/\])[\w\-/?=&.]*$/.test(next) ? next : '/chat'
