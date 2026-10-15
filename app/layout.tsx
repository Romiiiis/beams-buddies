import type { Metadata, Viewport } from 'next'
import './globals.css'

// Lock the initial zoom to the phone's width. Pages render a desktop layout for a moment
// before switching to mobile, and without a max scale iOS zooms out to fit that first
// frame and stays zoomed out on the first visit.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAFAFA',
}

export const metadata: Metadata = {
  title: 'Jobyra',
  description: 'Job and customer management for trades',
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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/jobyra-logo.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#FAFAFA' }}>
        {children}
      </body>
    </html>
  )
}