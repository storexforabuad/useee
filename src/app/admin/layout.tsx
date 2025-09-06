import '../globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '../../lib/themeContext'
import ClientProviders from '../../components/ClientProviders'

export const metadata: Metadata = {
  title: "Alaniq INT. Admin Dashboard",
  description: "Manage your store, products, and orders.",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Admin Dashboard",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <ClientProviders>
        {children}
      </ClientProviders>
    </ThemeProvider>
  )
}
