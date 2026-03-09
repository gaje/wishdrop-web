import './globals.css'
import './animations.css'
import Script from 'next/script'
import { AuthProvider } from '@/lib/AuthContext'
import { ViewTransitions } from 'next-view-transitions'
import PostHogProvider from '@/components/PostHogProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const GA_MEASUREMENT_ID = 'G-620WSTYSVM'

export const metadata = {
  metadataBase: new URL('https://wishdrop.app'),
  title: 'Wishdrop - Share Your Wishes',
  description: 'Create and share wishlists with friends and family. The smarter way to gift.',
  openGraph: {
    type: 'website',
    siteName: 'Wishdrop',
    images: [{ url: '/logo-circle.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    site: '@wishdropapp',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/logo-circle.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en">
        <head>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </head>
        <body className="min-h-screen flex flex-col">
          <AuthProvider>
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </AuthProvider>
          <PostHogProvider />
        </body>
      </html>
    </ViewTransitions>
  )
}
