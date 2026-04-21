import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jobyra',
  description: 'HVAC job and customer management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Jobyra',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1F9E94" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#ffffff' }}>{children}</body>
    </html>
  )
}