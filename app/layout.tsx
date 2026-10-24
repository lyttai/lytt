import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { ScrollButtons } from '@/components/ScrollButtons'
import { site } from '@/lib/site'
import './globals.css'

const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })

export const metadata: Metadata = { metadataBase: new URL(site.url), title: { default: 'lytt', template: '%s | lytt' }, description: 'lytt is a private AI chat assistant that runs on its own hardware.', applicationName: 'lytt', openGraph: { type: 'website', siteName: 'lytt', locale: 'en_US' }, twitter: { card: 'summary_large_image' }, robots: { index: true, follow: true } }

export const viewport: Viewport = { themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f5f3ee' }, { media: '(prefers-color-scheme: dark)', color: '#171615' }], width: 'device-width', initialScale: 1 }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies(), theme = store.get('theme')?.value
  return (
    <html lang="en" data-theme={theme === 'dark' || theme === 'light' ? theme : undefined} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Header />
        <div id="main" className="page">{children}</div>
        <Footer />
        <ScrollButtons />
        {!store.get('cookie_notice') && <CookieBanner />}
      </body>
    </html>
  )
}
