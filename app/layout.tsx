import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProviders } from '@/components/providers/app-providers'
import { SiteShell } from '@/components/layout/site-shell'
import { fontDisplay, fontSans } from '@/lib/fonts'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Beauty & Cosmetics`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <head />
      <body suppressHydrationWarning className="min-h-screen flex flex-col">
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  )
}
