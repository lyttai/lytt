'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type Api = { render: (el: HTMLElement, o: object) => string, reset: (id: string) => void, remove: (id: string) => void }
const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const api = () => (window as unknown as { turnstile?: Api }).turnstile

export function Turnstile({ reset }: { reset: unknown }) {
  const ref = useRef<HTMLDivElement>(null), id = useRef<string | null>(null), [ready, setReady] = useState(false)
  useEffect(() => { const t = api(); if (!ready || !sitekey || !ref.current || !t || id.current) return; id.current = t.render(ref.current, { sitekey, theme: 'auto', size: 'flexible' }); return () => { if (id.current) t.remove(id.current); id.current = null } }, [ready])
  useEffect(() => { if (id.current) api()?.reset(id.current) }, [reset])
  if (!sitekey) return null
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} /><div ref={ref} className="captcha" /></>
}
