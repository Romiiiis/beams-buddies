import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jobyra',
  description: 'HVAC job and customer management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Jobyra',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#FAFAFA' }}>
      <head>
        <meta name="theme-color" content="#FAFAFA" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/jobyra-logo.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#FAFAFA' }}>
        {children}
      </body>
    </html>
  )
}