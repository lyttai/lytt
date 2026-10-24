'use client'

import { useActionState, type ReactNode } from 'react'
import { Turnstile } from './Turnstile'
import type { FormState } from '@/lib/form'

export type Field = { name: string, label: ReactNode, type?: string, autoComplete?: string, hint?: string, max?: number }

export function Form({ action, fields, submit, captcha, hidden, danger }: { action: (s: FormState, f: FormData) => Promise<FormState>, fields: Field[], submit: string, captcha?: boolean, hidden?: Record<string, string>, danger?: boolean }) {
  const [state, run, pending] = useActionState(action, {})
  return (
    <form action={run} className="form" noValidate>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.ok && <p className="form-ok" role="status">{state.ok}</p>}
      {Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => {
        const err = state.fields?.[f.name]?.[0], described = err ? `${f.name}-error` : f.hint ? `${f.name}-hint` : undefined
        const input = <input id={f.name} name={f.name} type={f.type ?? 'text'} autoComplete={f.autoComplete} defaultValue={f.type === 'checkbox' || f.type === 'password' ? undefined : state.values?.[f.name]} aria-invalid={!!err} aria-describedby={described} maxLength={f.max} key={`${f.name}-${state.values?.[f.name] ?? ''}`} />
        return (
          <div className={f.type === 'checkbox' ? 'field check' : 'field'} key={f.name}>
            {f.type === 'checkbox' ? <label>{input}<span>{f.label}</span></label> : <><label htmlFor={f.name}>{f.label}</label>{input}</>}
            {f.hint && !err && <p id={`${f.name}-hint`} className="hint">{f.hint}</p>}
            {err && <p id={`${f.name}-error`} className="field-error">{err}</p>}
          </div>
        )
      })}
      {captcha && <Turnstile reset={state} />}
      <button className={danger ? 'button danger' : 'button'} disabled={pending}>{pending ? 'Working...' : submit}</button>
    </form>
  )
}
