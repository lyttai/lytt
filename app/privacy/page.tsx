import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Privacy policy', description: 'What lytt collects, where it is stored, who processes it, and how to delete it.', alternates: { canonical: '/privacy' } }

const contact = site.contact ? <a href={`mailto:${site.contact}`}>{site.contact}</a> : 'the contact address listed here'

export default function Page() {
  return (
    <main className="doc">
      <h1>Privacy policy</h1>
      <p className="muted">Last updated {site.updated}</p>
      <p>This policy covers the lytt website at {site.url.replace(/^https?:\/\//, '')} and the lytt chat assistant. Questions or requests go to {contact}.</p>

      <h2>What we collect</h2>
      <table>
        <thead><tr><th>Data</th><th>Why</th><th>Kept until</th></tr></thead>
        <tbody>
          <tr><td>Email address</td><td>Your login, and account emails you ask for</td><td>You delete your account</td></tr>
          <tr><td>Password</td><td>Your login. Stored only as a bcrypt hash by Supabase Auth, never in plain text</td><td>You delete your account</td></tr>
          <tr><td>Age confirmation</td><td>To keep lytt for people {site.minAge} and older. Your date of birth is checked on the server during signup and never stored, only a yes flag</td><td>You delete your account</td></tr>
          <tr><td>Terms acceptance time and email preference</td><td>Record of consent, and whether you want product emails (off by default)</td><td>You delete your account</td></tr>
          <tr><td>Chats, messages and the text of files you attach</td><td>To show your history and give lytt the context of the conversation. Encrypted with AES-256-GCM before storage</td><td>You delete the chat or your account</td></tr>
          <tr><td>Sign-in sessions and auth logs, including IP address and browser details</td><td>Keeping you signed in and protecting accounts</td><td>Sign out, session expiry, or account deletion</td></tr>
          <tr><td>Rate limit counters, keyed by your account ID or a SHA-256 hash of your IP address or email</td><td>Stopping password guessing and spam</td><td>Removed after one day</td></tr>
        </tbody>
      </table>
      <p>We do not collect payment details, contacts, location, or analytics. We do not sell or share your data for advertising, and there are no ads.</p>

      <h2>Where your data goes</h2>
      <table>
        <thead><tr><th>Service</th><th>What it does with your data</th><th>Location</th></tr></thead>
        <tbody>
          <tr><td>Supabase</td><td>Database and login system. Stores everything in the table above</td><td>AWS ap-northeast-2, Seoul, South Korea</td></tr>
          <tr><td>Vercel</td><td>Hosts this website and runs its server code. Your messages pass through it on the way to the model. Keeps standard request logs such as IP address and page requested</td><td>Server functions in the icn1 region, Seoul, South Korea. Pages are delivered through Vercel&apos;s global network</td></tr>
          <tr><td>Cloudflare</td><td>Carries messages from the website&apos;s server to the lytt machine through Cloudflare Tunnel, behind Cloudflare Access so nobody else can reach it. Also runs the Turnstile bot check on signup, login and password reset</td><td>Cloudflare&apos;s global network</td></tr>
          <tr><td>The lytt machine</td><td>A computer run by lytt&apos;s operator that runs the model with Ollama. It reads your conversation to write a reply and does not save chats</td><td>Operator&apos;s own hardware</td></tr>
          <tr><td>Supabase Auth email</td><td>Sends confirmation and password reset emails to your address</td><td>Supabase</td></tr>
        </tbody>
      </table>
      <p>Each provider handles data under its own privacy policy and keeps its own logs for its own limited retention period. Fonts are served from this site, so your browser does not contact Google or any font service.</p>

      <h2 id="cookies">Cookies</h2>
      <table>
        <thead><tr><th>Cookie</th><th>Purpose</th><th>Type</th></tr></thead>
        <tbody>
          <tr><td>sb-...-auth-token</td><td>Keeps you signed in. HttpOnly, Secure, SameSite=Lax</td><td>Essential</td></tr>
          <tr><td>theme</td><td>Remembers light or dark mode if you pick one</td><td>Preference</td></tr>
          <tr><td>cookie_notice</td><td>Remembers that you closed the cookie notice</td><td>Preference</td></tr>
        </tbody>
      </table>
      <p>There are no analytics, advertising or tracking cookies.</p>

      <h2>Security</h2>
      <ul>
        <li>All traffic uses HTTPS with HSTS.</li>
        <li>Chat text and titles are encrypted before they are written to the database, and database rules only let you read your own rows.</li>
        <li>The model can only be reached by this website&apos;s server using a secret access token.</li>
        <li>Logins are rate limited and protected by a bot check.</li>
      </ul>

      <h2>Your choices and rights</h2>
      <ul>
        <li><strong>Delete everything:</strong> <Link href="/settings">Settings</Link> has a delete button. It immediately erases your login, profile, chats, messages and the auth logs tied to your account from our database. Copies in a provider&apos;s backups, if any, expire on that provider&apos;s backup schedule.</li>
        <li><strong>Delete a chat:</strong> use Delete next to any chat.</li>
        <li><strong>Emails:</strong> product emails are off unless you turn them on. Turn them off in Settings or on the <Link href="/unsubscribe">unsubscribe page</Link>.</li>
        <li><strong>Access or correction:</strong> email {contact} and we will answer within 30 days.</li>
      </ul>

      <h2>Children</h2>
      <p>lytt is not for children under {site.minAge}. If we learn that an account belongs to someone younger, we delete it.</p>

      <h2>Changes</h2>
      <p>If this policy changes in a meaningful way, we will update the date above and tell signed-up users by email before the change applies.</p>
    </main>
  )
}
