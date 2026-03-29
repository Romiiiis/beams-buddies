import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jobyra',
  description: 'CRM for trade businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}