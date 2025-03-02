import './globals.css'
import { Metadata, Viewport } from 'next'
import { CartProvider } from '../lib/cartContext'
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
        <CartProvider>
          <Navbar />
          <main className="min-h-screen pt-16 bg-gray-50">
            {children}
          </main>
          <InstallPrompt />
        </CartProvider>
      </body>
    </html>
  )
}