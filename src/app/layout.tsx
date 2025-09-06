import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { CartProvider } from '../lib/cartContext'
import { ThemeProvider } from '../lib/themeContext'
import Navbar from '../components/layout/navbar'
import ClientProviders from '../components/ClientProviders'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Alaniq INT.",
  description: "Discover the finest items for your wardrobe",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alaniq INT.",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider>
          <CartProvider>
            <ClientProviders>
              <Navbar />
              {children}
            </ClientProviders>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}