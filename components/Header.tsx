import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { ThemeToggle } from './ThemeToggle'

export async function Header() {
  const user = await getUser()
  const links = user ? <><Link href="/chat">Chats</Link><Link href="/settings">Settings</Link><form action={logout}><button className="link-button">Log out</button></form></> : <><Link href="/privacy">Privacy</Link><Link href="/login">Log in</Link><Link href="/signup" className="button small">Sign up</Link></>
  return (
    <header className="site-header">
      <Link href={user ? '/chat' : '/'} className="wordmark" aria-label="lytt home">lytt</Link>
      <nav className="nav-desktop" aria-label="Main">{links}</nav>
      <div className="header-tools">
        <ThemeToggle />
        <details className="nav-mobile">
          <summary aria-label="Open menu"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" /></svg></summary>
          <nav aria-label="Mobile">{links}</nav>
        </details>
      </div>
    </header>
  )
}
