'use client'

const go = (top: number) => window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

export function ScrollButtons() {
  return (
    <div className="scroll-buttons">
      <button type="button" className="icon-button" onClick={() => go(0)} aria-label="Scroll to top" title="Scroll to top"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg></button>
      <button type="button" className="icon-button" onClick={() => go(document.documentElement.scrollHeight)} aria-label="Scroll to bottom" title="Scroll to bottom"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg></button>
    </div>
  )
}
