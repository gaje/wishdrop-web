import './globals.css'
import './animations.css'
import { AuthProvider } from '@/lib/AuthContext'
import { ViewTransitions } from 'next-view-transitions'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Wishdrop - Share Your Wishes',
  description: 'Create and share wishlists with friends and family. The smarter way to gift.',
}

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className="min-h-screen flex flex-col">
          <AuthProvider>
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </AuthProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
