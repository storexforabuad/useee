import './globals.css'
import { Metadata, Viewport } from 'next'
import { CartProvider } from '../lib/cartContext'
import { ThemeProvider } from '../lib/themeContext'
import Navbar from '../components/layout/navbar'
import InstallPrompt from '../components/InstallPrompt'

export const metadata: Metadata = {
  title: "LaDevidaStore",
  description: 'Quality products at wholesale prices',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "LaDevidaStore",
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen pt-16 bg-background text-foreground">
              {children}
            </main>
            <InstallPrompt />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}