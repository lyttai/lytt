import Link from 'next/link'

export function Footer() {
  return (
    <footer className="site-footer">
      <p>lytt runs on its own hardware. Chats are encrypted at rest and erased the moment you delete your account.</p>
      <nav aria-label="Footer"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/unsubscribe">Email preferences</Link><a href="/llms.txt">llms.txt</a></nav>
    </footer>
  )
}
