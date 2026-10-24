'use client'

export function ThemeToggle() {
  const toggle = () => { const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches, next = dark ? 'light' : 'dark'; r.dataset.theme = next; document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}` }
  return (
    <button type="button" className="icon-button" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor" /></svg>
    </button>
  )
}
