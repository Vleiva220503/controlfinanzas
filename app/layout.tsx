// app/layout.tsx
// Root layout — providers, fonts, metadata, PWA

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Control de Finanzas',
  description: 'Aplicación personal de control financiero — jade & victor',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Finanzas',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
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
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'var(--surface-elevated)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                },
              }}
              richColors
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
