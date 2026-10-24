import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/signup', '/login', '/forgot-password', '/privacy', '/terms', '/unsubscribe'].map((p) => ({ url: `${site.url}${p}`, lastModified: new Date('2026-10-24'), changeFrequency: p ? 'yearly' : 'monthly', priority: p ? 0.5 : 1 }))
}
