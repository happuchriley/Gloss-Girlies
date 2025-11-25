import type { Metadata, Viewport } from 'next'
import './globals.css'
import TopNav from '@/components/TopNav'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import AuthInitializer from '@/components/AuthInitializer'

export const metadata: Metadata = {
  title: 'Gloss Girlies - Beauty & Cosmetics',
  description: 'Your one-stop destination for beauty and cosmetics',
  icons: {
    icon: [
      { url: '/images/Gloss Girlies.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/images/Gloss Girlies.jpg', sizes: '16x16', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/images/Gloss Girlies.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
    shortcut: '/images/Gloss Girlies.jpg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical: Preload hero banner image with highest priority */}
        <link
          rel="preload"
          as="image"
          href="/images/Gloss Girlies.jpg"
          fetchPriority="high"
        />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://media6.ppl-media.com" />
        {/* Preconnect to speed up external requests */}
        <link rel="preconnect" href="https://media6.ppl-media.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <AuthInitializer />
        <TopNav />
        <main className="min-h-screen pb-16 sm:pb-20">
          {children}
        </main>
        <Footer />
        <BottomNav />
        <ScrollToTop />
      </body>
    </html>
  )
}

