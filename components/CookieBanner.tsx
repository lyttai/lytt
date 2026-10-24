'use client'

import Link from 'next/link'
import { useState } from 'react'

export function CookieBanner() {
  const [open, setOpen] = useState(true)
  const close = () => { document.cookie = `cookie_notice=1; path=/; max-age=31536000; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`; setOpen(false) }
  if (!open) return null
  return (
    <aside className="cookie-banner" aria-label="Cookie notice">
      <p>lytt only uses cookies that keep you signed in, remember your theme and remember that you closed this notice. No tracking, no ads. <Link href="/privacy#cookies">Details</Link></p>
      <button type="button" className="button small" onClick={close}>OK</button>
    </aside>
  )
}
